import Link from "next/link";
import { ArrowLeft, WalletCards } from "lucide-react";
import { CashSessionStatus, UserRole, UserStatus } from "@/generated/prisma/enums";
import {
  CloseCashForm,
  ExpenseForm,
  OpenCashForm,
} from "@/app/cash/cash-forms";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const moneyFormatter = new Intl.NumberFormat("es-HN", {
  style: "currency",
  currency: "HNL",
});

const dateFormatter = new Intl.DateTimeFormat("es-HN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function decimalToNumber(value: { toString(): string }) {
  return Number(value.toString());
}

function formatMoney(value: number | { toString(): string } | null) {
  if (value === null) {
    return "-";
  }

  const amount = typeof value === "number" ? value : decimalToNumber(value);
  return moneyFormatter.format(amount);
}

function formatDate(date: Date) {
  return dateFormatter.format(date);
}

function sessionTotals(session: {
  openingAmount: { toString(): string };
  payments: Array<{ amount: { toString(): string } }>;
  expenses: Array<{ amount: { toString(): string } }>;
}) {
  const opening = decimalToNumber(session.openingAmount);
  const payments = session.payments.reduce(
    (total, payment) => total + decimalToNumber(payment.amount),
    0,
  );
  const expenses = session.expenses.reduce(
    (total, expense) => total + decimalToNumber(expense.amount),
    0,
  );

  return {
    opening,
    payments,
    expenses,
    expected: opening + payments - expenses,
  };
}

export default async function CashPage() {
  const user = await requireSession();

  const [collectors, sessions] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: UserRole.COLLECTOR,
        status: UserStatus.ACTIVE,
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.cashSession.findMany({
      where:
        user.role === UserRole.ADMIN
          ? undefined
          : {
              collectorId: user.id,
            },
      orderBy: [{ sessionDate: "desc" }, { openedAt: "desc" }],
      take: 40,
      select: {
        id: true,
        sessionDate: true,
        openingAmount: true,
        expectedAmount: true,
        countedAmount: true,
        difference: true,
        status: true,
        openedAt: true,
        closedAt: true,
        notes: true,
        collector: {
          select: {
            name: true,
            email: true,
          },
        },
        payments: {
          orderBy: { paidAt: "desc" },
          select: {
            id: true,
            amount: true,
            method: true,
            paidAt: true,
            client: {
              select: { fullName: true },
            },
          },
        },
        expenses: {
          orderBy: { spentAt: "desc" },
          select: {
            id: true,
            amount: true,
            category: true,
            description: true,
            spentAt: true,
          },
        },
      },
    }),
  ]);

  const openSessions = sessions.filter(
    (session) => session.status === CashSessionStatus.OPEN,
  );
  const totals = sessions.reduce(
    (summary, session) => {
      const current = sessionTotals(session);
      return {
        payments: summary.payments + current.payments,
        expenses: summary.expenses + current.expenses,
        openExpected:
          summary.openExpected +
          (session.status === CashSessionStatus.OPEN ? current.expected : 0),
      };
    },
    { payments: 0, expenses: 0, openExpected: 0 },
  );

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <Link
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">
                Entrega, gastos y cuadre
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-normal sm:text-3xl">
                Caja diaria
              </h1>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
              <WalletCards className="h-4 w-4 text-emerald-700" />
              {user.name} / {user.role}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-950 shadow-sm">
            <p className="text-sm font-medium">Recaudos</p>
            <p className="mt-3 text-2xl font-semibold">
              {formatMoney(totals.payments)}
            </p>
          </article>
          <article className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-950 shadow-sm">
            <p className="text-sm font-medium">Gastos</p>
            <p className="mt-3 text-2xl font-semibold">
              {formatMoney(totals.expenses)}
            </p>
          </article>
          <article className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sky-950 shadow-sm">
            <p className="text-sm font-medium">Esperado abierto</p>
            <p className="mt-3 text-2xl font-semibold">
              {formatMoney(totals.openExpected)}
            </p>
            <p className="mt-1 text-sm opacity-75">
              {openSessions.length} cajas abiertas
            </p>
          </article>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
          <aside className="h-fit rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold">Abrir caja</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              La caja agrupa pagos y gastos del cobrador para el cuadre diario.
            </p>
            {user.role === UserRole.ADMIN ? (
              <div className="mt-4">
                <OpenCashForm collectors={collectors} />
              </div>
            ) : (
              <p className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                Solo el administrador puede abrir cajas.
              </p>
            )}
          </aside>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <h2 className="text-base font-semibold">Sesiones de caja</h2>
              <p className="mt-1 text-sm text-slate-600">
                {sessions.length} sesiones recientes.
              </p>
            </div>

            <div className="mt-4 space-y-4">
              {sessions.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <WalletCards className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-3 text-sm font-medium text-slate-700">
                    No hay cajas para mostrar.
                  </p>
                </div>
              ) : null}

              {sessions.map((session) => {
                const current = sessionTotals(session);
                const isOpen = session.status === CashSessionStatus.OPEN;

                return (
                  <article
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                    key={session.id}
                  >
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold">
                            {session.collector.name}
                          </h3>
                          <span
                            className={`rounded-md px-2 py-1 text-xs font-medium ring-1 ${
                              isOpen
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                : "bg-slate-100 text-slate-600 ring-slate-200"
                            }`}
                          >
                            {isOpen ? "Abierta" : "Cerrada"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                          {formatDate(session.sessionDate)} /{" "}
                          {session.collector.email}
                        </p>
                      </div>

                      <div className="grid gap-2 text-sm sm:grid-cols-2 xl:min-w-[420px]">
                        <CashStat label="Inicial" value={current.opening} />
                        <CashStat label="Recaudos" value={current.payments} />
                        <CashStat label="Gastos" value={current.expenses} />
                        <CashStat
                          label={isOpen ? "Esperado" : "Diferencia"}
                          value={
                            isOpen
                              ? current.expected
                              : session.difference ?? current.expected
                          }
                        />
                      </div>
                    </div>

                    {isOpen ? (
                      <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <section className="rounded-md border border-slate-200 bg-white p-3">
                          <h4 className="text-sm font-semibold">
                            Registrar gasto
                          </h4>
                          <ExpenseForm cashSessionId={session.id} />
                        </section>
                        <section className="rounded-md border border-slate-200 bg-white p-3">
                          <h4 className="text-sm font-semibold">
                            Cierre de caja
                          </h4>
                          <CloseCashForm cashSessionId={session.id} />
                        </section>
                      </div>
                    ) : (
                      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
                        <CashStat
                          label="Esperado"
                          value={session.expectedAmount}
                        />
                        <CashStat label="Contado" value={session.countedAmount} />
                        <CashStat label="Diferencia" value={session.difference} />
                      </div>
                    )}

                    <details className="mt-4 rounded-md border border-slate-200 bg-white">
                      <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-slate-700">
                        Ver movimientos
                      </summary>
                      <div className="grid gap-4 border-t border-slate-200 p-3 lg:grid-cols-2">
                        <section>
                          <h4 className="text-sm font-semibold">Pagos</h4>
                          <div className="mt-2 space-y-2">
                            {session.payments.length === 0 ? (
                              <p className="text-sm text-slate-500">
                                Sin pagos vinculados.
                              </p>
                            ) : null}
                            {session.payments.map((payment) => (
                              <div
                                className="rounded-md bg-slate-50 p-3 ring-1 ring-slate-200"
                                key={payment.id}
                              >
                                <div className="flex justify-between gap-3">
                                  <p className="text-sm font-medium">
                                    {payment.client.fullName}
                                  </p>
                                  <p className="text-sm font-semibold">
                                    {formatMoney(payment.amount)}
                                  </p>
                                </div>
                                <p className="mt-1 text-xs text-slate-500">
                                  {payment.method} / {formatDate(payment.paidAt)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </section>
                        <section>
                          <h4 className="text-sm font-semibold">Gastos</h4>
                          <div className="mt-2 space-y-2">
                            {session.expenses.length === 0 ? (
                              <p className="text-sm text-slate-500">
                                Sin gastos registrados.
                              </p>
                            ) : null}
                            {session.expenses.map((expense) => (
                              <div
                                className="rounded-md bg-slate-50 p-3 ring-1 ring-slate-200"
                                key={expense.id}
                              >
                                <div className="flex justify-between gap-3">
                                  <p className="text-sm font-medium">
                                    {expense.category}
                                  </p>
                                  <p className="text-sm font-semibold">
                                    {formatMoney(expense.amount)}
                                  </p>
                                </div>
                                <p className="mt-1 text-xs text-slate-500">
                                  {expense.description || "Sin descripcion"} /{" "}
                                  {formatDate(expense.spentAt)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </section>
                      </div>
                    </details>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function CashStat({
  label,
  value,
}: {
  label: string;
  value: number | { toString(): string } | null;
}) {
  return (
    <div className="rounded-md bg-white p-3 ring-1 ring-slate-200">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 font-semibold">{formatMoney(value)}</p>
    </div>
  );
}
