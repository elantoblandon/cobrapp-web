"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { PaymentMethod } from "@/generated/prisma/enums";
import { registerInstallmentPayment } from "@/lib/payment-service";
import { requireSession } from "@/lib/session";

const paymentSchema = z.object({
  installmentId: z.string().min(1, "Selecciona una cuota."),
  amount: z.coerce
    .number()
    .positive("El pago debe ser mayor que cero.")
    .transform((value) => Math.round(value * 100)),
  method: z.enum([PaymentMethod.CASH, PaymentMethod.TRANSFER, PaymentMethod.OTHER]),
  paidAt: z.string().min(1, "Selecciona la fecha del pago."),
  notes: z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : undefined))
    .optional(),
});

export type PaymentFormState = {
  error?: string;
  success?: string;
};

function parseInputDate(value: string) {
  return new Date(`${value}T12:00:00.000Z`);
}

export async function registerPaymentAction(
  _previousState: PaymentFormState,
  formData: FormData,
): Promise<PaymentFormState> {
  const user = await requireSession();

  const parsed = paymentSchema.safeParse({
    installmentId: formData.get("installmentId"),
    amount: formData.get("amount"),
    method: formData.get("method"),
    paidAt: formData.get("paidAt"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Datos invalidos.",
    };
  }

  const result = await registerInstallmentPayment(user, {
    installmentId: parsed.data.installmentId,
    amountCents: parsed.data.amount,
    method: parsed.data.method,
    paidAt: parseInputDate(parsed.data.paidAt),
    notes: parsed.data.notes,
  });

  revalidatePath("/payments");
  revalidatePath("/collector");
  revalidatePath("/loans");
  revalidatePath("/clients");
  revalidatePath("/cash");
  return result;
}
