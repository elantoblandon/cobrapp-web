import {
  Banknote,
  MapPinned,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Users,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import {
  CashSessionStatus,
  InstallmentStatus,
  LoanStatus,
  UserRole,
} from "@/generated/prisma/enums";
import { AppShell } from "@/components/app-shell";
import { MetricCard, Panel, SummaryRow } from "@/components/dashboard-ui";
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
      accent: "emerald" as const,
    },
    {
      label: "Dinero en la calle",
      value: formatMoney(streetMoney),
      detail: `${activeLoans.length} prestamos activos`,
      accent: "sky" as const,
    },
    {
      label: "Clientes en mora",
      value: `${overdueClients}`,
      detail: `${formatMoney(overdueAmount)} vencido`,
      accent: "rose" as const,
    },
    {
      label: "Caja abierta",
      value: `${openCashSessions.length}`,
      detail: `${formatMoney(openCashExpected)} esperado`,
      accent: "amber" as const,
    },
  ];

  return (
    <AppShell
      description="Métricas vivas de cartera, cobros, mora y caja para operar el negocio desde un solo panel."
      eyebrow="Cobrapp Web MVP"
      title="Panel administrativo"
      user={user}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard
            accent={metric.accent}
            detail={metric.detail}
            key={metric.label}
            label={metric.label}
            value={metric.value}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
        <Panel
          description="Accesos principales de operación."
          title="Módulos del MVP"
        >
          <div className="grid gap-3 sm:grid-cols-2">
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
        </Panel>

        <Panel title="Desempeño de hoy">
          <div className="space-y-3">
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
                <SummaryRow
                  detail={`${collector.status} / ${
                    collector.cashSessions.length > 0
                      ? "Caja abierta"
                      : "Sin caja abierta"
                  }`}
                  key={collector.id}
                  title={collector.name}
                  value={formatMoney(total)}
                />
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Últimos pagos">
          <div className="space-y-3">
            {recentPayments.length === 0 ? (
              <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                Aun no hay pagos registrados.
              </p>
            ) : null}
            {recentPayments.map((payment) => (
              <SummaryRow
                detail={`${payment.method} / ${formatDate(payment.paidAt)} / ${
                  payment.collector.name
                }`}
                key={payment.id}
                title={payment.client.fullName}
                value={formatMoney(payment.amount)}
              />
            ))}
          </div>
        </Panel>

        <Panel title="Próximas cuotas">
          <div className="space-y-3">
            {upcomingInstallments.length === 0 ? (
              <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                No hay cuotas próximas.
              </p>
            ) : null}
            {upcomingInstallments.map((installment) => {
              const remaining =
                decimalToNumber(installment.amountDue) -
                decimalToNumber(installment.amountPaid);

              return (
                <SummaryRow
                  detail={`Cuota ${installment.number} / vence ${formatDate(
                    installment.dueDate,
                  )}`}
                  key={installment.id}
                  title={installment.loan.client.fullName}
                  value={formatMoney(remaining)}
                />
              );
            })}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
