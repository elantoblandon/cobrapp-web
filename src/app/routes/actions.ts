"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ClientStatus, UserRole, UserStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : undefined))
  .optional();

const routeSchema = z.object({
  name: z.string().trim().min(2, "Ingresa el nombre de la ruta."),
  description: optionalText,
});

const routeIdSchema = z.object({
  routeId: z.string().min(1),
});

const assignCollectorSchema = routeIdSchema.extend({
  collectorId: z.string().min(1, "Selecciona un cobrador."),
});

const assignClientSchema = routeIdSchema.extend({
  clientId: z.string().min(1, "Selecciona un cliente."),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

const routeClientIdSchema = z.object({
  routeClientId: z.string().min(1),
});

const routeAssignmentIdSchema = z.object({
  routeAssignmentId: z.string().min(1),
});

export type RouteFormState = {
  error?: string;
  success?: string;
};

export async function createRouteAction(
  _previousState: RouteFormState,
  formData: FormData,
): Promise<RouteFormState> {
  await requireAdmin();

  const parsed = routeSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos invalidos." };
  }

  await prisma.route.create({
    data: parsed.data,
  });

  revalidatePath("/routes");
  return { success: "Ruta creada correctamente." };
}

export async function toggleRouteAction(formData: FormData) {
  await requireAdmin();

  const parsed = routeIdSchema.safeParse({
    routeId: formData.get("routeId"),
  });

  if (!parsed.success) {
    return;
  }

  const route = await prisma.route.findUnique({
    where: { id: parsed.data.routeId },
    select: { isActive: true },
  });

  if (!route) {
    return;
  }

  await prisma.route.update({
    where: { id: parsed.data.routeId },
    data: { isActive: !route.isActive },
  });

  revalidatePath("/routes");
}

export async function assignCollectorAction(
  _previousState: RouteFormState,
  formData: FormData,
): Promise<RouteFormState> {
  await requireAdmin();

  const parsed = assignCollectorSchema.safeParse({
    routeId: formData.get("routeId"),
    collectorId: formData.get("collectorId"),
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

  const activeAssignment = await prisma.routeAssignment.findFirst({
    where: {
      routeId: parsed.data.routeId,
      collectorId: parsed.data.collectorId,
      endsAt: null,
    },
    select: { id: true },
  });

  if (activeAssignment) {
    return { error: "Ese cobrador ya esta activo en esta ruta." };
  }

  await prisma.routeAssignment.create({
    data: parsed.data,
  });

  revalidatePath("/routes");
  return { success: "Cobrador asignado." };
}

export async function removeCollectorAssignmentAction(formData: FormData) {
  await requireAdmin();

  const parsed = routeAssignmentIdSchema.safeParse({
    routeAssignmentId: formData.get("routeAssignmentId"),
  });

  if (!parsed.success) {
    return;
  }

  await prisma.routeAssignment.update({
    where: { id: parsed.data.routeAssignmentId },
    data: { endsAt: new Date() },
  });

  revalidatePath("/routes");
}

export async function assignClientAction(
  _previousState: RouteFormState,
  formData: FormData,
): Promise<RouteFormState> {
  await requireAdmin();

  const parsed = assignClientSchema.safeParse({
    routeId: formData.get("routeId"),
    clientId: formData.get("clientId"),
    sortOrder: formData.get("sortOrder") || 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos invalidos." };
  }

  const client = await prisma.client.findUnique({
    where: { id: parsed.data.clientId },
    select: { status: true },
  });

  if (!client || client.status !== ClientStatus.ACTIVE) {
    return { error: "Selecciona un cliente activo." };
  }

  const activeRouteClient = await prisma.routeClient.findFirst({
    where: {
      routeId: parsed.data.routeId,
      clientId: parsed.data.clientId,
      endsAt: null,
    },
    select: { id: true },
  });

  if (activeRouteClient) {
    return { error: "Ese cliente ya esta activo en esta ruta." };
  }

  await prisma.routeClient.create({
    data: parsed.data,
  });

  revalidatePath("/routes");
  return { success: "Cliente asignado." };
}

export async function removeClientAssignmentAction(formData: FormData) {
  await requireAdmin();

  const parsed = routeClientIdSchema.safeParse({
    routeClientId: formData.get("routeClientId"),
  });

  if (!parsed.success) {
    return;
  }

  await prisma.routeClient.update({
    where: { id: parsed.data.routeClientId },
    data: { endsAt: new Date() },
  });

  revalidatePath("/routes");
}
