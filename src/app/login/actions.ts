"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSession, destroySession } from "@/lib/session";

const loginSchema = z.object({
  email: z.email("Ingresa un correo valido.").toLowerCase(),
  password: z.string().min(1, "Ingresa tu contrasena."),
});

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos invalidos." };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      passwordHash: true,
    },
  });

  if (!user || user.status !== "ACTIVE" || !user.passwordHash) {
    return { error: "Correo o contrasena incorrectos." };
  }

  const passwordMatches = await verifyPassword(
    parsed.data.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    return { error: "Correo o contrasena incorrectos." };
  }

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  redirect("/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
