import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { UserRole } from "@/generated/prisma/enums";
import { getAuthSecret } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "cobrapp_session";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type SessionPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

function getSecretKey() {
  return new TextEncoder().encode(getAuthSecret());
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({
    email: user.email,
    role: user.role,
  } satisfies Omit<SessionPayload, "sub">)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecretKey());

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const session = payload as SessionPayload;

    if (!session.sub) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user || user.status !== "ACTIVE") {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  } catch {
    return null;
  }
}

export async function requireSession() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireSession();

  if (user.role !== UserRole.ADMIN) {
    redirect("/");
  }

  return user;
}
