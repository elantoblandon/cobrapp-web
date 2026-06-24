import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getErrorDetails(error: unknown) {
  if (!(error instanceof Error)) {
    return { name: "UnknownError", message: "Unknown database error" };
  }

  const maybePrismaError = error as Error & { code?: string };

  return {
    name: error.name,
    code: maybePrismaError.code,
    message: error.message.slice(0, 300),
  };
}

export async function GET() {
  try {
    await prisma.user.count();

    return NextResponse.json({
      ok: true,
      database: "ok",
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        database: "error",
        error: getErrorDetails(error),
        checkedAt: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
