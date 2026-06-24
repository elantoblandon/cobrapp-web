import Link from "next/link";
import { ArrowLeft, Banknote, CalendarDays, Search } from "lucide-react";
import {
  ClientStatus,
  LoanStatus,
  PaymentFrequency,
} from "@/generated/prisma/enums";
import { LoanForm } from "@/app/loans/loan-form";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const frequencyLabel: Record<PaymentFrequency, string> = {
  DAILY: "Diario",
  WEEKLY: "Semanal",
  BIWEEKLY: "Quincenal",
  MONTHLY: "Mensual",
};

const loanStatusLabel: Record<LoanStatus, string> = {
  DRAFT: "Borrador",
  ACTIVE: "Activo",
  PAID: "Pagado",
  OVERDUE: "En mora",
  DEFAULTED: "Incobrable",
  CANCELLED: "Cancelado",
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

function formatMoney(value: { toString(): string }) {
  return moneyFormatter.format(Number(value.toString()));
}

function formatDate(date: Date) {
  return dateFormatter.format(date);
}

type LoansPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function LoansPage({ searchParams }: LoansPageProps) {
  const user = await requireAdmin();
  const { q } = await searchParams;
  const query = q?.trim();

  const [clients, loans] = await Promise.all([
    prisma.client.findMany({
      where: { status: ClientStatus.ACTIVE },
      orderBy: { fullName: "asc" },
      select: {
        id: true,
        fullName: true,
        identityNumber: true,
      },
    }),
    prisma.loan.findMany({
      where: query
        ? {
            client: {
              OR: [
                { fullName: { contains: query, mode: "insensitive" } },
                { identityNumber: { contains: query, mode: "insensitive" } },
                { phone: { contains: query, mode: "insensitive" } },
              ],
            },
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        principalAmount: true,
        interestAmount: true,
        totalAmount: true,
        installmentAmount: true,
        frequency: true,
        termInstallments: true,
        startDate: true,
        firstDueDate: true,
        expectedEndDate: true,
        status: true,
        automaticLateFee: true,
        lateFeeAmount: true,
        notes: true,
        createdAt: true,
        client: {
          select: {
            fullName: true,
            identityNumber: true,
            phone: true,
          },
        },
        createdBy: {
          select: {
            name: true,
          },
        },
        installments: {
          orderBy: { number: "asc" },
          select: {
            id: true,
            number: true,
            dueDate: true,
            amountDue: true,
            amountPaid: true,
            status: true,
          },
        },
      },
    }),
  ]);

  const activePortfolio = loans
    .filter((loan) => loan.status === LoanStatus.ACTIVE)
    .reduce((total, loan) => total + Number(loan.totalAmount.toString()), 0);

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
                Creditos y calendario
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-normal sm:text-3xl">
                Prestamos
              </h1>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
              <Banknote className="h-4 w-4 text-emerald-700" />
              {user.name} / ADMIN
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[420px_1fr] lg:px-8">
        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold">Crear prestamo</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            El sistema calcula el total, cuotas y fechas de vencimiento segun la
            modalidad seleccionada.
          </p>
          {clients.length === 0 ? (
            <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Primero crea al menos un cliente activo.
            </p>
          ) : null}
          <div className="mt-4">
            <LoanForm clients={clients} />
          </div>
        </aside>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-base font-semibold">Cartera de prestamos</h2>
              <p className="mt-1 text-sm text-slate-600">
                {loans.length} prestamos, cartera activa{" "}
                {moneyFormatter.format(activePortfolio)}.
              </p>
            </div>

            <form className="flex w-full gap-2 xl:w-96">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  defaultValue={query}
                  name="q"
                  placeholder="Buscar por cliente"
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
            {loans.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <CalendarDays className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-3 text-sm font-medium text-slate-700">
                  No hay prestamos para mostrar.
                </p>
              </div>
            ) : null}

            {loans.map((loan) => (
              <article
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                key={loan.id}
              >
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold">
                        {loan.client.fullName}
                      </h3>
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-medium ring-1 ${
                          loan.status === LoanStatus.ACTIVE
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                            : loan.status === LoanStatus.OVERDUE
                              ? "bg-rose-50 text-rose-700 ring-rose-200"
                              : "bg-slate-100 text-slate-600 ring-slate-200"
                        }`}
                      >
                        {loanStatusLabel[loan.status]}
                      </span>
                      <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                        {frequencyLabel[loan.frequency]}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {loan.client.identityNumber || "Sin identidad"} /{" "}
                      {loan.client.phone || "Sin telefono"}
                    </p>
                    <p className="mt-2 text-xs font-medium text-slate-500">
                      Creado por {loan.createdBy.name} el{" "}
                      {formatDate(loan.createdAt)}
                    </p>
                  </div>

                  <div className="grid gap-2 text-sm sm:grid-cols-2 xl:min-w-80">
                    <div className="rounded-md bg-white p-3 ring-1 ring-slate-200">
                      <p className="text-xs font-medium text-slate-500">
                        Principal
                      </p>
                      <p className="mt-1 font-semibold">
                        {formatMoney(loan.principalAmount)}
                      </p>
                    </div>
                    <div className="rounded-md bg-white p-3 ring-1 ring-slate-200">
                      <p className="text-xs font-medium text-slate-500">
                        Total a cobrar
                      </p>
                      <p className="mt-1 font-semibold">
                        {formatMoney(loan.totalAmount)}
                      </p>
                    </div>
                    <div className="rounded-md bg-white p-3 ring-1 ring-slate-200">
                      <p className="text-xs font-medium text-slate-500">
                        Cuota base
                      </p>
                      <p className="mt-1 font-semibold">
                        {formatMoney(loan.installmentAmount)}
                      </p>
                    </div>
                    <div className="rounded-md bg-white p-3 ring-1 ring-slate-200">
                      <p className="text-xs font-medium text-slate-500">
                        Finaliza
                      </p>
                      <p className="mt-1 font-semibold">
                        {formatDate(loan.expectedEndDate)}
                      </p>
                    </div>
                  </div>
                </div>

                <details className="mt-3 rounded-md border border-slate-200 bg-white">
                  <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-slate-700">
                    Ver calendario de {loan.termInstallments} cuotas
                  </summary>
                  <div className="grid gap-2 border-t border-slate-200 p-3 sm:grid-cols-2 xl:grid-cols-3">
                    {loan.installments.map((installment) => (
                      <div
                        className="rounded-md border border-slate-200 bg-slate-50 p-3"
                        key={installment.id}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold">
                            Cuota {installment.number}
                          </p>
                          <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                            {installment.status}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                          Vence {formatDate(installment.dueDate)}
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-950">
                          {formatMoney(installment.amountDue)}
                        </p>
                      </div>
                    ))}
                  </div>
                </details>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
