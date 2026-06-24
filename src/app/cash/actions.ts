"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CashSessionStatus, UserRole, UserStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireSession } from "@/lib/session";

const moneySchema = z.coerce
  .number()
  .min(0, "El monto no puede ser negativo.")
  .transform((value) => Math.round(value * 100));

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : undefined))
  .optional();

const openCashSchema = z.object({
  collectorId: z.string().min(1, "Selecciona un cobrador."),
  sessionDate: z.string().min(1, "Selecciona una fecha."),
  openingAmount: moneySchema,
  notes: optionalText,
});

const expenseSchema = z.object({
  cashSessionId: z.string().min(1, "Selecciona una caja."),
  amount: moneySchema.refine((value) => value > 0, {
    message: "El gasto debe ser mayor que cero.",
  }),
  category: z.string().trim().min(2, "Ingresa la categoria."),
  description: optionalText,
});

const closeCashSchema = z.object({
  cashSessionId: z.string().min(1),
  countedAmount: moneySchema,
  notes: optionalText,
});

export type CashFormState = {
  error?: string;
  success?: string;
};

function parseInputDate(value: string) {
  return new Date(`${value}T12:00:00.000Z`);
}

function todayInputDate() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12),
  );
}

function decimalToCents(value: { toString(): string }) {
  return Math.round(Number(value.toString()) * 100);
}

function toMoneyString(cents: number) {
  return (cents / 100).toFixed(2);
}

async function canUseCashSession(sessionId: string, userId: string, role: UserRole) {
  if (role === UserRole.ADMIN) {
    return true;
  }

  const session = await prisma.cashSession.findUnique({
    where: { id: sessionId },
    select: { collectorId: true },
  });

  return session?.collectorId === userId;
}

export async function openCashSessionAction(
  _previousState: CashFormState,
  formData: FormData,
): Promise<CashFormState> {
  const user = await requireAdmin();

  const parsed = openCashSchema.safeParse({
    collectorId: formData.get("collectorId"),
    sessionDate: formData.get("sessionDate"),
    openingAmount: formData.get("openingAmount"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos invalidos." };
  }

  const collector = await prisma.user.findUnique({
    where: { id: parsed.data.collectorId },
    select: { role: true, status: true },
  });

  if (
    !collector ||
    collector.role !== UserRole.COLLECTOR ||
    collector.status !== UserStatus.ACTIVE
  ) {
    return { error: "Selecciona un cobrador activo." };
  }

  try {
    await prisma.cashSession.create({
      data: {
        collectorId: parsed.data.collectorId,
        openedById: user.id,
        sessionDate: parseInputDate(parsed.data.sessionDate),
        openingAmount: toMoneyString(parsed.data.openingAmount),
        notes: parsed.data.notes,
      },
    });
  } catch {
    return { error: "Ese cobrador ya tiene caja creada para esa fecha." };
  }

  revalidatePath("/cash");
  revalidatePath("/collector");
  return { success: "Caja abierta correctamente." };
}

export async function addExpenseAction(
  _previousState: CashFormState,
  formData: FormData,
): Promise<CashFormState> {
  const user = await requireSession();

  const parsed = expenseSchema.safeParse({
    cashSessionId: formData.get("cashSessionId"),
    amount: formData.get("amount"),
    category: formData.get("category"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos invalidos." };
  }

  if (!(await canUseCashSession(parsed.data.cashSessionId, user.id, user.role))) {
    return { error: "No tienes acceso a esta caja." };
  }

  const session = await prisma.cashSession.findUnique({
    where: { id: parsed.data.cashSessionId },
    select: { collectorId: true, status: true },
  });

  if (!session || session.status !== CashSessionStatus.OPEN) {
    return { error: "La caja debe estar abierta para registrar gastos." };
  }

  await prisma.expense.create({
    data: {
      collectorId: session.collectorId,
      cashSessionId: parsed.data.cashSessionId,
      amount: toMoneyString(parsed.data.amount),
      category: parsed.data.category,
      description: parsed.data.description,
      spentAt: todayInputDate(),
    },
  });

  revalidatePath("/cash");
  revalidatePath("/collector");
  return { success: "Gasto registrado." };
}

export async function closeCashSessionAction(
  _previousState: CashFormState,
  formData: FormData,
): Promise<CashFormState> {
  const user = await requireSession();

  const parsed = closeCashSchema.safeParse({
    cashSessionId: formData.get("cashSessionId"),
    countedAmount: formData.get("countedAmount"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos invalidos." };
  }

  if (!(await canUseCashSession(parsed.data.cashSessionId, user.id, user.role))) {
    return { error: "No tienes acceso a esta caja." };
  }

  const session = await prisma.cashSession.findUnique({
    where: { id: parsed.data.cashSessionId },
    select: {
      openingAmount: true,
      status: true,
      payments: { select: { amount: true } },
      expenses: { select: { amount: true } },
    },
  });

  if (!session || session.status !== CashSessionStatus.OPEN) {
    return { error: "La caja no esta abierta." };
  }

  const openingCents = decimalToCents(session.openingAmount);
  const paymentsCents = session.payments.reduce(
    (total, payment) => total + decimalToCents(payment.amount),
    0,
  );
  const expensesCents = session.expenses.reduce(
    (total, expense) => total + decimalToCents(expense.amount),
    0,
  );
  const expectedCents = openingCents + paymentsCents - expensesCents;
  const differenceCents = parsed.data.countedAmount - expectedCents;

  await prisma.cashSession.update({
    where: { id: parsed.data.cashSessionId },
    data: {
      expectedAmount: toMoneyString(expectedCents),
      countedAmount: toMoneyString(parsed.data.countedAmount),
      difference: toMoneyString(differenceCents),
      status: CashSessionStatus.CLOSED,
      closedAt: new Date(),
      notes: parsed.data.notes,
    },
  });

  revalidatePath("/cash");
  revalidatePath("/collector");
  return { success: "Caja cerrada correctamente." };
}
