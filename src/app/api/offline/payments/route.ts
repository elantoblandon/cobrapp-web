import { NextResponse } from "next/server";
import { z } from "zod";
import { PaymentMethod } from "@/generated/prisma/enums";
import { registerInstallmentPayment } from "@/lib/payment-service";
import { getSessionUser } from "@/lib/session";

const offlinePaymentSchema = z.object({
  offlineKey: z.string().min(8),
  installmentId: z.string().min(1),
  amountCents: z.number().int().positive(),
  method: z.enum([PaymentMethod.CASH, PaymentMethod.TRANSFER, PaymentMethod.OTHER]),
  paidAt: z.string().datetime(),
  notes: z.string().optional(),
});

const requestSchema = z.object({
  payments: z.array(offlinePaymentSchema).min(1).max(50),
});

export async function POST(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json(
      { error: "Sesion requerida para sincronizar." },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos de sincronizacion invalidos." },
      { status: 400 },
    );
  }

  const results = [];

  for (const payment of parsed.data.payments) {
    const result = await registerInstallmentPayment(user, {
      offlineKey: payment.offlineKey,
      installmentId: payment.installmentId,
      amountCents: payment.amountCents,
      method: payment.method,
      paidAt: new Date(payment.paidAt),
      notes: payment.notes,
    });

    results.push({
      offlineKey: payment.offlineKey,
      ok: !result.error,
      error: result.error,
      alreadySynced: result.alreadySynced ?? false,
    });
  }

  return NextResponse.json({ results });
}
