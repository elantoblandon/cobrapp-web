"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ClientStatus, CreditRating } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireSession } from "@/lib/session";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : undefined))
  .optional();

const clientSchema = z.object({
  fullName: z.string().trim().min(3, "Ingresa el nombre completo."),
  identityNumber: optionalText,
  phone: optionalText,
  address: optionalText,
  businessName: optionalText,
  businessAddress: optionalText,
  creditRating: z.enum([
    CreditRating.NEW,
    CreditRating.GOOD,
    CreditRating.WATCH,
    CreditRating.RISKY,
    CreditRating.BAD,
  ]),
  notes: optionalText,
});

const updateClientSchema = clientSchema.extend({
  clientId: z.string().min(1),
  status: z.enum([
    ClientStatus.ACTIVE,
    ClientStatus.INACTIVE,
    ClientStatus.BLOCKED,
  ]),
});

const clientIdSchema = z.object({
  clientId: z.string().min(1),
});

export type ClientFormState = {
  error?: string;
  success?: string;
};

export async function createClientAction(
  _previousState: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  await requireSession();

  const parsed = clientSchema.safeParse({
    fullName: formData.get("fullName"),
    identityNumber: formData.get("identityNumber") || undefined,
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
    businessName: formData.get("businessName") || undefined,
    businessAddress: formData.get("businessAddress") || undefined,
    creditRating: formData.get("creditRating"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Datos invalidos.",
    };
  }

  await prisma.client.create({
    data: parsed.data,
  });

  revalidatePath("/clients");
  return { success: "Cliente creado correctamente." };
}

export async function updateClientAction(
  _previousState: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  await requireAdmin();

  const parsed = updateClientSchema.safeParse({
    clientId: formData.get("clientId"),
    fullName: formData.get("fullName"),
    identityNumber: formData.get("identityNumber") || undefined,
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
    businessName: formData.get("businessName") || undefined,
    businessAddress: formData.get("businessAddress") || undefined,
    creditRating: formData.get("creditRating"),
    status: formData.get("status"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Datos invalidos.",
    };
  }

  const { clientId, ...data } = parsed.data;

  await prisma.client.update({
    where: { id: clientId },
    data,
  });

  revalidatePath("/clients");
  return { success: "Cliente actualizado." };
}

export async function setClientStatusAction(formData: FormData) {
  await requireAdmin();

  const parsed = clientIdSchema.safeParse({
    clientId: formData.get("clientId"),
  });

  if (!parsed.success) {
    return;
  }

  const client = await prisma.client.findUnique({
    where: { id: parsed.data.clientId },
    select: { status: true },
  });

  if (!client) {
    return;
  }

  await prisma.client.update({
    where: { id: parsed.data.clientId },
    data: {
      status:
        client.status === ClientStatus.ACTIVE
          ? ClientStatus.INACTIVE
          : ClientStatus.ACTIVE,
    },
  });

  revalidatePath("/clients");
}
