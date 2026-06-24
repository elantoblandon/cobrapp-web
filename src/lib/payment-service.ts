import {
  InstallmentStatus,
  LoanStatus,
  PaymentMethod,
  UserRole,
} from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/session";

export type RegisterPaymentInput = {
  installmentId: string;
  amountCents: number;
  method: PaymentMethod;
  paidAt: Date;
  notes?: string;
  offlineKey?: string;
};

export type RegisterPaymentResult = {
  error?: string;
  success?: string;
  alreadySynced?: boolean;
};

function decimalToCents(value: { toString(): string }) {
  return Math.round(Number(value.toString()) * 100);
}

function toMoneyString(cents: number) {
  return (cents / 100).toFixed(2);
}

function todayAtNoonUtc() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12),
  );
}

export async function registerInstallmentPayment(
  user: SessionUser,
  input: RegisterPaymentInput,
): Promise<RegisterPaymentResult> {
  if (input.offlineKey) {
    const existingPayment = await prisma.payment.findUnique({
      where: { offlineKey: input.offlineKey },
      select: { id: true },
    });

    if (existingPayment) {
      return { success: "Pago ya sincronizado.", alreadySynced: true };
    }
  }

  return prisma.$transaction(async (tx) => {
    const installment = await tx.installment.findUnique({
      where: { id: input.installmentId },
      select: {
        id: true,
        loanId: true,
        amountDue: true,
        amountPaid: true,
        status: true,
        loan: {
          select: {
            id: true,
            clientId: true,
            status: true,
          },
        },
      },
    });

    if (!installment) {
      return { error: "La cuota no existe." };
    }

    if (user.role === UserRole.COLLECTOR) {
      const routeAccess = await tx.routeClient.findFirst({
        where: {
          clientId: installment.loan.clientId,
          endsAt: null,
          route: {
            isActive: true,
            assignments: {
              some: {
                collectorId: user.id,
                endsAt: null,
              },
            },
          },
        },
        select: { id: true },
      });

      if (!routeAccess) {
        return { error: "No tienes esta cuota asignada en tu ruta." };
      }
    }

    if (
      installment.status === InstallmentStatus.PAID ||
      installment.status === InstallmentStatus.CANCELLED
    ) {
      return { error: "Esta cuota ya no admite pagos." };
    }

    if (
      installment.loan.status === LoanStatus.CANCELLED ||
      installment.loan.status === LoanStatus.PAID
    ) {
      return { error: "Este prestamo ya no admite cobros." };
    }

    const dueCents = decimalToCents(installment.amountDue);
    const paidCents = decimalToCents(installment.amountPaid);
    const remainingCents = dueCents - paidCents;

    if (input.amountCents > remainingCents) {
      return {
        error: `El pago supera el saldo de la cuota (${toMoneyString(
          remainingCents,
        )}).`,
      };
    }

    const newPaidCents = paidCents + input.amountCents;
    const isPaid = newPaidCents >= dueCents;
    const cashSession = await tx.cashSession.findFirst({
      where: {
        collectorId: user.id,
        status: "OPEN",
      },
      orderBy: { openedAt: "desc" },
      select: { id: true },
    });

    await tx.payment.create({
      data: {
        loanId: installment.loanId,
        installmentId: installment.id,
        clientId: installment.loan.clientId,
        collectorId: user.id,
        cashSessionId: cashSession?.id,
        amount: toMoneyString(input.amountCents),
        method: input.method,
        paidAt: input.paidAt,
        notes: input.notes,
        offlineKey: input.offlineKey,
        syncedAt: input.offlineKey ? new Date() : undefined,
      },
    });

    await tx.installment.update({
      where: { id: installment.id },
      data: {
        amountPaid: toMoneyString(newPaidCents),
        status: isPaid ? InstallmentStatus.PAID : InstallmentStatus.PARTIAL,
        paidAt: isPaid ? input.paidAt : null,
      },
    });

    const openInstallments = await tx.installment.findMany({
      where: { loanId: installment.loanId },
      select: {
        dueDate: true,
        status: true,
      },
    });

    const allPaid = openInstallments.every(
      (item) => item.status === InstallmentStatus.PAID,
    );
    const today = todayAtNoonUtc();
    const hasOverdue = openInstallments.some(
      (item) =>
        item.status !== InstallmentStatus.PAID &&
        item.status !== InstallmentStatus.CANCELLED &&
        item.dueDate < today,
    );

    await tx.loan.update({
      where: { id: installment.loanId },
      data: {
        status: allPaid
          ? LoanStatus.PAID
          : hasOverdue
            ? LoanStatus.OVERDUE
            : LoanStatus.ACTIVE,
      },
    });

    return { success: "Pago registrado correctamente." };
  });
}
