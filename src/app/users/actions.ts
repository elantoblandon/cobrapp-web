"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { UserRole, UserStatus } from "@/generated/prisma/enums";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const userRoleSchema = z.enum([UserRole.ADMIN, UserRole.COLLECTOR]);

const createUserSchema = z.object({
  name: z.string().trim().min(2, "Ingresa el nombre completo."),
  email: z.email("Ingresa un correo valido.").toLowerCase(),
  phone: z.string().trim().optional(),
  role: userRoleSchema,
  password: z
    .string()
    .min(8, "La contrasena debe tener al menos 8 caracteres."),
});

const userIdSchema = z.object({
  userId: z.string().min(1),
});

const passwordSchema = userIdSchema.extend({
  password: z
    .string()
    .min(8, "La nueva contrasena debe tener al menos 8 caracteres."),
});

export type CreateUserState = {
  error?: string;
  success?: string;
};

export type PasswordState = {
  error?: string;
  success?: string;
};

export async function createUserAction(
  _previousState: CreateUserState,
  formData: FormData,
): Promise<CreateUserState> {
  await requireAdmin();

  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    role: formData.get("role"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Datos invalidos.",
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existingUser) {
    return { error: "Ya existe un usuario con ese correo." };
  }

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      role: parsed.data.role,
      passwordHash: await hashPassword(parsed.data.password),
    },
  });

  revalidatePath("/users");
  return { success: "Usuario creado correctamente." };
}

export async function setUserStatusAction(formData: FormData) {
  const currentUser = await requireAdmin();
  const parsed = userIdSchema.safeParse({
    userId: formData.get("userId"),
  });

  if (!parsed.success || parsed.data.userId === currentUser.id) {
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { status: true },
  });

  if (!user) {
    return;
  }

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: {
      status:
        user.status === UserStatus.ACTIVE
          ? UserStatus.INACTIVE
          : UserStatus.ACTIVE,
    },
  });

  revalidatePath("/users");
}

export async function updatePasswordAction(
  _previousState: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  await requireAdmin();

  const parsed = passwordSchema.safeParse({
    userId: formData.get("userId"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Datos invalidos.",
    };
  }

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: {
      passwordHash: await hashPassword(parsed.data.password),
    },
  });

  revalidatePath("/users");
  return { success: "Contrasena actualizada." };
}
