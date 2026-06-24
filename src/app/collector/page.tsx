import Link from "next/link";
import { MapPin, MapPinned, Phone, ReceiptText, Route } from "lucide-react";
import {
  InstallmentStatus,
  LoanStatus,
  PaymentFrequency,
  UserRole,
} from "@/generated/prisma/enums";
import { PaymentForm } from "@/app/payments/payment-form";
import { AppShell } from "@/components/app-shell";
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

export default async function CollectorPage() {
  const user = await requireSession();
  const today = todayAtNoonUtc();

  const assignedRoutes = await prisma.route.findMany({
    where:
      user.role === UserRole.ADMIN
        ? { isActive: true }
        : {
            isActive: true,
            assignments: {
              some: {
                collectorId: user.id,
                endsAt: null,
              },
            },
          },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      clients: {
        where: { endsAt: null },
        orderBy: [{ sortOrder: "asc" }, { startsAt: "asc" }],
        select: {
          sortOrder: true,
          client: {
            select: {
              id: true,
              fullName: true,
              identityNumber: true,
              phone: true,
              address: true,
              businessName: true,
              loans: {
                where: {
                  status: {
                    in: [LoanStatus.ACTIVE, LoanStatus.OVERDUE],
                  },
                },
                orderBy: { createdAt: "desc" },
                select: {
                  id: true,
                  frequency: true,
                  status: true,
                  installments: {
                    where: {
                      status: {
                        in: [
                          InstallmentStatus.PENDING,
                          InstallmentStatus.PARTIAL,
                          InstallmentStatus.OVERDUE,
                        ],
                      },
                    },
                    orderBy: [{ dueDate: "asc" }, { number: "asc" }],
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
              },
            },
          },
        },
      },
    },
  });

  const visibleInstallments = assignedRoutes.flatMap((routeItem) =>
    routeItem.clients.flatMap((routeClient) =>
      routeClient.client.loans.flatMap((loan) =>
        loan.installments.map((installment) => ({
          routeName: routeItem.name,
          clientName: routeClient.client.fullName,
          installment,
        })),
      ),
    ),
  );

  const totals = visibleInstallments.reduce(
    (summary, item) => {
      const due = decimalToNumber(item.installment.amountDue);
      const paid = decimalToNumber(item.installment.amountPaid);
      const remaining = due - paid;
      const isOverdue = item.installment.dueDate < today;

      return {
        pendingAmount: summary.pendingAmount + remaining,
        overdueAmount: summary.overdueAmount + (isOverdue ? remaining : 0),
        overdueCount: summary.overdueCount + (isOverdue ? 1 : 0),
      };
    },
    { pendingAmount: 0, overdueAmount: 0, overdueCount: 0 },
  );

  return (
    <AppShell
      description={`${user.name} / ${assignedRoutes.length} rutas asignadas`}
      eyebrow="Vista del cobrador"
      title="Ruta de cobro"
      user={user}
    >
      <section className="mx-auto max-w-3xl">
        <div className="grid gap-3 sm:grid-cols-3">
          <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-950 shadow-sm">
            <p className="text-sm font-medium">Pendiente</p>
            <p className="mt-2 text-xl font-semibold">
              {formatMoney(totals.pendingAmount)}
            </p>
          </article>
          <article className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-950 shadow-sm">
            <p className="text-sm font-medium">Mora</p>
            <p className="mt-2 text-xl font-semibold">
              {formatMoney(totals.overdueAmount)}
            </p>
            <p className="mt-1 text-xs opacity-75">
              {totals.overdueCount} cuotas vencidas
            </p>
          </article>
          <article className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sky-950 shadow-sm">
            <p className="text-sm font-medium">Cuotas</p>
            <p className="mt-2 text-xl font-semibold">
              {visibleInstallments.length}
            </p>
          </article>
        </div>

        <div className="mt-5 space-y-4">
          {assignedRoutes.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
              <Route className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-3 text-sm font-medium text-slate-700">
                No tienes rutas asignadas.
              </p>
            </div>
          ) : null}

          {assignedRoutes.map((routeItem) => (
            <section
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              key={routeItem.id}
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <MapPinned className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-semibold">{routeItem.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {routeItem.description || "Sin descripcion"}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {routeItem.clients.length === 0 ? (
                  <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                    Esta ruta no tiene clientes activos.
                  </p>
                ) : null}

                {routeItem.clients.map((routeClient) => {
                  const openLoans = routeClient.client.loans.filter(
                    (loan) => loan.installments.length > 0,
                  );

                  return (
                    <article
                      className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                      key={routeClient.client.id}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold sm:text-sm">
                              {routeClient.client.fullName}
                            </h3>
                            <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                              #{routeClient.sortOrder}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-600">
                            {routeClient.client.identityNumber ||
                              "Sin identidad"}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          {routeClient.client.phone ? (
                            <a
                              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-emerald-200 bg-white text-emerald-700 transition hover:bg-emerald-50"
                              href={`tel:${routeClient.client.phone}`}
                              title="Llamar"
                            >
                              <Phone className="h-4 w-4" />
                            </a>
                          ) : null}
                          {routeClient.client.address ? (
                            <a
                              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-sky-200 bg-white text-sky-700 transition hover:bg-sky-50"
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                routeClient.client.address,
                              )}`}
                              rel="noreferrer"
                              target="_blank"
                              title="Abrir direccion"
                            >
                              <MapPin className="h-4 w-4" />
                            </a>
                          ) : null}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        {routeClient.client.phone || "Sin telefono"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {routeClient.client.businessName ||
                          routeClient.client.address ||
                          "Sin negocio o direccion"}
                      </p>

                      <div className="mt-3 space-y-3">
                        {openLoans.length === 0 ? (
                          <p className="rounded-md bg-white p-3 text-sm text-slate-500 ring-1 ring-slate-200">
                            Sin cuotas abiertas.
                          </p>
                        ) : null}

                        {openLoans.map((loan) =>
                          loan.installments.map((installment) => {
                            const due = decimalToNumber(installment.amountDue);
                            const paid = decimalToNumber(
                              installment.amountPaid,
                            );
                            const remaining = due - paid;
                            const isOverdue = installment.dueDate < today;

                            return (
                              <div
                                className={`rounded-md border p-3 ${
                                  isOverdue
                                    ? "border-rose-200 bg-rose-50"
                                    : "border-slate-200 bg-white"
                                }`}
                                key={installment.id}
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div>
                                    <p className="text-sm font-semibold">
                                      Cuota {installment.number}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                      {frequencyLabel[loan.frequency]} / vence{" "}
                                      {formatDate(installment.dueDate)}
                                    </p>
                                  </div>
                                  <span
                                    className={`rounded-md px-2 py-1 text-xs font-medium ring-1 ${
                                      isOverdue
                                        ? "bg-white text-rose-700 ring-rose-200"
                                        : "bg-slate-50 text-slate-700 ring-slate-200"
                                    }`}
                                  >
                                    {formatMoney(remaining)}
                                  </span>
                                </div>
                                <PaymentForm
                                  installmentId={installment.id}
                                  maxAmount={toInputAmount(remaining)}
                                />
                              </div>
                            );
                          }),
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <Link
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          href="/payments"
        >
          <ReceiptText className="h-4 w-4" />
          Ver cobros generales
        </Link>
      </section>
    </AppShell>
  );
}
