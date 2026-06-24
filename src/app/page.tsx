import {
  Banknote,
  CalendarClock,
  MapPinned,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Users,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { logoutAction } from "@/app/login/actions";
import {
  CashSessionStatus,
  InstallmentStatus,
  LoanStatus,
  UserRole,
} from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const modules = [
  {
    name: "Vista cobrador",
    description: "Rutas asignadas y cobros desde telefono.",
    icon: Smartphone,
    href: "/collector",
  },
  {
    name: "Usuarios",
    description: "Administradores, cobradores, estados y contrasenas.",
    icon: ShieldCheck,
    href: "/users",
  },
  {
    name: "Clientes",
    description: "Registro, historial crediticio y estado del cliente.",
    icon: Users,
    href: "/clients",
  },
  {
    name: "Prestamos",
    description: "Creditos diarios, semanales, quincenales y mensuales.",
    icon: Banknote,
    href: "/loans",
  },
  {
    name: "Rutas",
    description: "Asignacion de clientes y cobradores por zona.",
    icon: MapPinned,
    href: "/routes",
  },
  {
    name: "Cobros",
    description: "Pagos, abonos, cuotas vencidas y novedades.",
    icon: ReceiptText,
    href: "/payments",
  },
  {
    name: "Caja",
    description: "Entrega, gastos, recaudo, cierre y diferencias.",
    icon: WalletCards,
    href: "/cash",
  },
  {
    name: "Offline",
    description: "Pagos guardados en telefono y sincronizacion segura.",
    icon: Smartphone,
    href: "#",
  },
];

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

function todayRange() {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0),
  );
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
}

function todayAtNoonUtc() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12),
  );
}

export default async function Home() {
  const user = await requireSession();
  const { start, end } = todayRange();
  const today = todayAtNoonUtc();

  const [
    paymentsToday,
    activeLoans,
    overdueInstallments,
    openCashSessions,
    collectors,
    recentPayments,
    upcomingInstallments,
  ] = await Promise.all([
    prisma.payment.findMany({
      where: { paidAt: { gte: start, lt: end } },
      select: { amount: true },
    }),
    prisma.loan.findMany({
      where: { status: { in: [LoanStatus.ACTIVE, LoanStatus.OVERDUE] } },
      select: {
        totalAmount: true,
        payments: { select: { amount: true } },
      },
    }),
    prisma.installment.findMany({
      where: {
        dueDate: { lt: today },
        status: {
          in: [
            InstallmentStatus.PENDING,
            InstallmentStatus.PARTIAL,
            InstallmentStatus.OVERDUE,
          ],
        },
      },
      select: {
        amountDue: true,
        amountPaid: true,
        loan: { select: { clientId: true } },
      },
    }),
    prisma.cashSession.findMany({
      where: { status: CashSessionStatus.OPEN },
      select: {
        openingAmount: true,
        payments: { select: { amount: true } },
        expenses: { select: { amount: true } },
        collectorId: true,
      },
    }),
    prisma.user.findMany({
      where: { role: UserRole.COLLECTOR },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        status: true,
        collectedPayments: {
          where: { paidAt: { gte: start, lt: end } },
          select: { amount: true },
        },
        cashSessions: {
          where: { status: CashSessionStatus.OPEN },
          select: { id: true },
        },
      },
    }),
    prisma.payment.findMany({
      orderBy: { paidAt: "desc" },
      take: 6,
      select: {
        id: true,
        amount: true,
        method: true,
        paidAt: true,
        client: { select: { fullName: true } },
        collector: { select: { name: true } },
      },
    }),
    prisma.installment.findMany({
      where: {
        dueDate: { gte: today },
        status: {
          in: [
            InstallmentStatus.PENDING,
            InstallmentStatus.PARTIAL,
            InstallmentStatus.OVERDUE,
          ],
        },
      },
      orderBy: { dueDate: "asc" },
      take: 6,
      select: {
        id: true,
        number: true,
        dueDate: true,
        amountDue: true,
        amountPaid: true,
        loan: {
          select: {
            client: { select: { fullName: true } },
          },
        },
      },
    }),
  ]);

  const collectedToday = paymentsToday.reduce(
    (total, payment) => total + decimalToNumber(payment.amount),
    0,
  );
  const streetMoney = activeLoans.reduce((total, loan) => {
    const paid = loan.payments.reduce(
      (sum, payment) => sum + decimalToNumber(payment.amount),
      0,
    );
    return total + Math.max(decimalToNumber(loan.totalAmount) - paid, 0);
  }, 0);
  const overdueAmount = overdueInstallments.reduce((total, installment) => {
    const due = decimalToNumber(installment.amountDue);
    const paid = decimalToNumber(installment.amountPaid);
    return total + Math.max(due - paid, 0);
  }, 0);
  const overdueClients = new Set(
    overdueInstallments.map((installment) => installment.loan.clientId),
  ).size;
  const openCashExpected = openCashSessions.reduce((total, session) => {
    const opening = decimalToNumber(session.openingAmount);
    const payments = session.payments.reduce(
      (sum, payment) => sum + decimalToNumber(payment.amount),
      0,
    );
    const expenses = session.expenses.reduce(
      (sum, expense) => sum + decimalToNumber(expense.amount),
      0,
    );
    return total + opening + payments - expenses;
  }, 0);

  const metrics = [
    {
      label: "Cobros de hoy",
      value: formatMoney(collectedToday),
      detail: `${paymentsToday.length} pagos registrados`,
      tone: "border-emerald-200 bg-emerald-50 text-emerald-950",
    },
    {
      label: "Dinero en la calle",
      value: formatMoney(streetMoney),
      detail: `${activeLoans.length} prestamos activos`,
      tone: "border-sky-200 bg-sky-50 text-sky-950",
    },
    {
      label: "Clientes en mora",
      value: `${overdueClients}`,
      detail: `${formatMoney(overdueAmount)} vencido`,
      tone: "border-rose-200 bg-rose-50 text-rose-950",
    },
    {
      label: "Caja abierta",
      value: `${openCashSessions.length}`,
      detail: `${formatMoney(openCashExpected)} esperado`,
      tone: "border-amber-200 bg-amber-50 text-amber-950",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">
                Cobrapp Web MVP
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">
                Panel administrativo de prestamos y cobros
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                {user.name} / {user.role}
              </span>
              <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                <CalendarClock className="h-4 w-4 text-sky-700" />
                Honduras / HNL
              </span>
              <form action={logoutAction}>
                <button
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  type="submit"
                >
                  Salir
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <article
              className={`rounded-lg border p-4 shadow-sm ${metric.tone}`}
              key={metric.label}
            >
              <p className="text-sm font-medium">{metric.label}</p>
              <p className="mt-3 text-2xl font-semibold tracking-normal">
                {metric.value}
              </p>
              <p className="mt-1 text-sm opacity-75">{metric.detail}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-slate-950">
                  Modulos del MVP
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Accesos principales de operacion.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {modules.map((module) => {
                const Icon = module.icon;

                return (
                  <Link
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-200 hover:bg-white"
                    href={module.href}
                    key={module.name}
                  >
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white text-emerald-700 ring-1 ring-slate-200">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-950">
                          {module.name}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {module.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-slate-950">
              Desempeno de hoy
            </h2>
            <div className="mt-4 space-y-3">
              {collectors.length === 0 ? (
                <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                  Aun no hay cobradores.
                </p>
              ) : null}

              {collectors.map((collector) => {
                const total = collector.collectedPayments.reduce(
                  (sum, payment) => sum + decimalToNumber(payment.amount),
                  0,
                );

                return (
                  <div
                    className="rounded-md border border-slate-200 bg-slate-50 p-3"
                    key={collector.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">
                          {collector.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {collector.status} /{" "}
                          {collector.cashSessions.length > 0
                            ? "Caja abierta"
                            : "Sin caja abierta"}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">
                        {formatMoney(total)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-slate-950">
              Ultimos pagos
            </h2>
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
                        {payment.method} / {formatDate(payment.paidAt)} /{" "}
                        {payment.collector.name}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">
                      {formatMoney(payment.amount)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-slate-950">
              Proximas cuotas
            </h2>
            <div className="mt-4 space-y-3">
              {upcomingInstallments.length === 0 ? (
                <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                  No hay cuotas proximas.
                </p>
              ) : null}
              {upcomingInstallments.map((installment) => {
                const remaining =
                  decimalToNumber(installment.amountDue) -
                  decimalToNumber(installment.amountPaid);

                return (
                  <article
                    className="rounded-md border border-slate-200 bg-slate-50 p-3"
                    key={installment.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">
                          {installment.loan.client.fullName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Cuota {installment.number} / vence{" "}
                          {formatDate(installment.dueDate)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">
                        {formatMoney(remaining)}
                      </p>
                    </div>
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
