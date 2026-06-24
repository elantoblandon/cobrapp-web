"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ClientStatus, PaymentFrequency } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const frequencySchema = z.enum([
  PaymentFrequency.DAILY,
  PaymentFrequency.WEEKLY,
  PaymentFrequency.BIWEEKLY,
  PaymentFrequency.MONTHLY,
]);

const moneySchema = z.coerce
  .number()
  .positive("El monto debe ser mayor que cero.")
  .transform((value) => Math.round(value * 100));

const optionalMoneySchema = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce
    .number()
    .nonnegative("La mora no puede ser negativa.")
    .optional()
    .transform((value) =>
      typeof value === "number" ? Math.round(value * 100) : undefined,
    ),
);

const loanSchema = z.object({
  clientId: z.string().min(1, "Selecciona un cliente."),
  principalAmount: moneySchema,
  interestType: z.enum(["AMOUNT", "PERCENT"]),
  interestValue: z.coerce
    .number()
    .nonnegative("El interes no puede ser negativo."),
  frequency: frequencySchema,
  termInstallments: z.coerce
    .number()
    .int()
    .min(1, "Debe tener al menos una cuota.")
    .max(365, "El plazo es demasiado largo para el MVP."),
  startDate: z.string().min(1, "Selecciona fecha de inicio."),
  automaticLateFee: z.preprocess((value) => value === "on", z.boolean()),
  lateFeeAmount: optionalMoneySchema,
  notes: z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : undefined))
    .optional(),
});

export type LoanFormState = {
  error?: string;
  success?: string;
};

function toMoneyString(cents: number) {
  return (cents / 100).toFixed(2);
}

function parseInputDate(value: string) {
  return new Date(`${value}T12:00:00.000Z`);
}

function addInstallmentPeriod(date: Date, frequency: PaymentFrequency, step = 1) {
  const next = new Date(date);

  if (frequency === PaymentFrequency.MONTHLY) {
    next.setUTCMonth(next.getUTCMonth() + step);
    return next;
  }

  const daysByFrequency: Record<PaymentFrequency, number> = {
    DAILY: 1,
    WEEKLY: 7,
    BIWEEKLY: 14,
    MONTHLY: 30,
  };

  next.setUTCDate(next.getUTCDate() + daysByFrequency[frequency] * step);
  return next;
}

function buildInstallments(
  totalCents: number,
  termInstallments: number,
  startDate: Date,
  frequency: PaymentFrequency,
) {
  const baseAmount = Math.floor(totalCents / termInstallments);
  let assignedCents = 0;

  return Array.from({ length: termInstallments }, (_, index) => {
    const isLast = index === termInstallments - 1;
    const amountCents = isLast ? totalCents - assignedCents : baseAmount;
    assignedCents += amountCents;

    return {
      number: index + 1,
      dueDate: addInstallmentPeriod(startDate, frequency, index + 1),
      amountDue: toMoneyString(amountCents),
    };
  });
}

export async function createLoanAction(
  _previousState: LoanFormState,
  formData: FormData,
): Promise<LoanFormState> {
  const user = await requireAdmin();

  const parsed = loanSchema.safeParse({
    clientId: formData.get("clientId"),
    principalAmount: formData.get("principalAmount"),
    interestType: formData.get("interestType"),
    interestValue: formData.get("interestValue"),
    frequency: formData.get("frequency"),
    termInstallments: formData.get("termInstallments"),
    startDate: formData.get("startDate"),
    automaticLateFee: formData.get("automaticLateFee"),
    lateFeeAmount: formData.get("lateFeeAmount"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Datos invalidos.",
    };
  }

  const client = await prisma.client.findUnique({
    where: { id: parsed.data.clientId },
    select: { status: true },
  });

  if (!client || client.status !== ClientStatus.ACTIVE) {
    return { error: "El cliente debe estar activo para crear un prestamo." };
  }

  const principalCents = parsed.data.principalAmount;
  const interestCents =
    parsed.data.interestType === "PERCENT"
      ? Math.round(principalCents * (parsed.data.interestValue / 100))
      : Math.round(parsed.data.interestValue * 100);
  const totalCents = principalCents + interestCents;
  const installmentCents = Math.floor(totalCents / parsed.data.termInstallments);
  const startDate = parseInputDate(parsed.data.startDate);
  const installments = buildInstallments(
    totalCents,
    parsed.data.termInstallments,
    startDate,
    parsed.data.frequency,
  );

  await prisma.loan.create({
    data: {
      clientId: parsed.data.clientId,
      createdById: user.id,
      principalAmount: toMoneyString(principalCents),
      interestAmount: toMoneyString(interestCents),
      totalAmount: toMoneyString(totalCents),
      installmentAmount: toMoneyString(installmentCents),
      frequency: parsed.data.frequency,
      termInstallments: parsed.data.termInstallments,
      startDate,
      firstDueDate: installments[0].dueDate,
      expectedEndDate: installments[installments.length - 1].dueDate,
      automaticLateFee: parsed.data.automaticLateFee,
      lateFeeAmount:
        parsed.data.lateFeeAmount !== undefined
          ? toMoneyString(parsed.data.lateFeeAmount)
          : undefined,
      notes: parsed.data.notes,
      installments: {
        create: installments,
      },
    },
  });

  revalidatePath("/loans");
  revalidatePath("/clients");
  return { success: "Prestamo creado con su calendario de cuotas." };
}
