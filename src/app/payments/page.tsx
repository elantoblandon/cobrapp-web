import Link from "next/link";
import { ArrowLeft, ReceiptText, Search, WalletCards } from "lucide-react";
import {
  InstallmentStatus,
  LoanStatus,
  PaymentFrequency,
} from "@/generated/prisma/enums";
import { PaymentForm } from "@/app/payments/payment-form";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const frequencyLabel: Record<PaymentFrequency, string> = {
  DAILY: "Diario",
  WEEKLY: "Semanal",
  BIWEEKLY: "Quincenal",
  MONTHLY: "Mensual",
};

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

function formatMoney(value: number | { toString(): string }) {
  const amount = typeof value === "number" ? value : decimalToNumber(value);
  return moneyFormatter.format(amount);
}

function formatDate(date: Date) {
  return dateFormatter.format(date);
}

function toInputAmount(value: number) {
  return value.toFixed(2);
}

function todayAtNoonUtc() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12),
  );
}

type PaymentsPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
  const user = await requireSession();
  const { q } = await searchParams;
  const query = q?.trim();
  const today = todayAtNoonUtc();

  const [installments, recentPayments] = await Promise.all([
    prisma.installment.findMany({
      where: {
        status: {
          in: [
            InstallmentStatus.PENDING,
            InstallmentStatus.PARTIAL,
            InstallmentStatus.OVERDUE,
          ],
        },
        loan: {
          status: {
            in: [LoanStatus.ACTIVE, LoanStatus.OVERDUE],
          },
          client: query
            ? {
                OR: [
                  { fullName: { contains: query, mode: "insensitive" } },
                  { identityNumber: { contains: query, mode: "insensitive" } },
                  { phone: { contains: query, mode: "insensitive" } },
                ],
              }
            : undefined,
        },
      },
      orderBy: [{ dueDate: "asc" }, { number: "asc" }],
      take: 80,
      select: {
        id: true,
        number: true,
        dueDate: true,
        amountDue: true,
        amountPaid: true,
        status: true,
        loan: {
          select: {
            id: true,
            frequency: true,
            status: true,
            client: {
              select: {
                fullName: true,
                identityNumber: true,
                phone: true,
                businessName: true,
              },
            },
          },
        },
      },
    }),
    prisma.payment.findMany({
      orderBy: { paidAt: "desc" },
      take: 12,
      select: {
        id: true,
        amount: true,
        method: true,
        paidAt: true,
        client: {
          select: {
            fullName: true,
          },
        },
        collector: {
          select: {
            name: true,
          },
        },
        installment: {
          select: {
            number: true,
          },
        },
      },
    }),
  ]);

  const totals = installments.reduce(
    (summary, installment) => {
      const due = decimalToNumber(installment.amountDue);
      const paid = decimalToNumber(installment.amountPaid);
      const remaining = due - paid;
      const isOverdue = installment.dueDate < today;

      return {
        pendingAmount: summary.pendingAmount + remaining,
        overdueAmount: summary.overdueAmount + (isOverdue ? remaining : 0),
        overdueCount: summary.overdueCount + (isOverdue ? 1 : 0),
      };
    },
    { pendingAmount: 0, overdueAmount: 0, overdueCount: 0 },
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
                Registro de abonos y pagos
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-normal sm:text-3xl">
                Cobros
              </h1>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
              <ReceiptText className="h-4 w-4 text-emerald-700" />
              {user.name} / {user.role}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-950 shadow-sm">
            <p className="text-sm font-medium">Pendiente por cobrar</p>
            <p className="mt-3 text-2xl font-semibold">
              {formatMoney(totals.pendingAmount)}
            </p>
          </article>
          <article className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-950 shadow-sm">
            <p className="text-sm font-medium">En mora</p>
            <p className="mt-3 text-2xl font-semibold">
              {formatMoney(totals.overdueAmount)}
            </p>
            <p className="mt-1 text-sm opacity-75">
              {totals.overdueCount} cuotas vencidas
            </p>
          </article>
          <article className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sky-950 shadow-sm">
            <p className="text-sm font-medium">Cuotas abiertas</p>
            <p className="mt-3 text-2xl font-semibold">{installments.length}</p>
          </article>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-base font-semibold">Cuotas por cobrar</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Registra pagos completos o abonos parciales.
                </p>
              </div>
              <form className="flex w-full gap-2 xl:w-96">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    defaultValue={query}
                    name="q"
                    placeholder="Buscar cliente"
                  />
                </div>
                <button
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  type="submit"
                >
                  Buscar
                </button>
              </form>
            </div>

            <div className="mt-4 space-y-3">
              {installments.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <WalletCards className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-3 text-sm font-medium text-slate-700">
                    No hay cuotas pendientes.
                  </p>
                </div>
              ) : null}

              {installments.map((installment) => {
                const due = decimalToNumber(installment.amountDue);
                const paid = decimalToNumber(installment.amountPaid);
                const remaining = due - paid;
                const isOverdue = installment.dueDate < today;

                return (
                  <article
                    className={`rounded-lg border p-4 ${
                      isOverdue
                        ? "border-rose-200 bg-rose-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                    key={installment.id}
                  >
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold">
                            {installment.loan.client.fullName}
                          </h3>
                          <span
                            className={`rounded-md px-2 py-1 text-xs font-medium ring-1 ${
                              isOverdue
                                ? "bg-white text-rose-700 ring-rose-200"
                                : "bg-white text-slate-700 ring-slate-200"
                            }`}
                          >
                            Cuota {installment.number}
                          </span>
                          <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                            {frequencyLabel[installment.loan.frequency]}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                          {installment.loan.client.identityNumber ||
                            "Sin identidad"}{" "}
                          / {installment.loan.client.phone || "Sin telefono"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {installment.loan.client.businessName ||
                            "Sin negocio registrado"}
                        </p>
                      </div>

                      <div className="grid gap-2 text-sm sm:grid-cols-3 xl:min-w-[420px]">
                        <div className="rounded-md bg-white p-3 ring-1 ring-slate-200">
                          <p className="text-xs font-medium text-slate-500">
                            Vence
                          </p>
                          <p className="mt-1 font-semibold">
                            {formatDate(installment.dueDate)}
                          </p>
                        </div>
                        <div className="rounded-md bg-white p-3 ring-1 ring-slate-200">
                          <p className="text-xs font-medium text-slate-500">
                            Pagado
                          </p>
                          <p className="mt-1 font-semibold">
                            {formatMoney(paid)}
                          </p>
                        </div>
                        <div className="rounded-md bg-white p-3 ring-1 ring-slate-200">
                          <p className="text-xs font-medium text-slate-500">
                            Saldo
                          </p>
                          <p className="mt-1 font-semibold">
                            {formatMoney(remaining)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <PaymentForm
                      installmentId={installment.id}
                      maxAmount={toInputAmount(remaining)}
                    />
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="h-fit rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold">Ultimos pagos</h2>
            <div className="mt-4 space-y-3">
              {recentPayments.length === 0 ? (
                <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                  Aun no hay pagos registrados.
                </p>
              ) : null}

              {recentPayments.map((payment) => (
                <article
                  className="rounded-md border border-slate-200 bg-slate-50 p-3"
                  key={payment.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">
                        {payment.client.fullName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Cuota {payment.installment?.number ?? "-"} /{" "}
                        {payment.method}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">
                      {formatMoney(payment.amount)}
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {formatDate(payment.paidAt)} por {payment.collector.name}
                  </p>
                </article>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
