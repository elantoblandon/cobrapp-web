import { Search, Users } from "lucide-react";
import { ClientForm } from "@/app/clients/client-form";
import { setClientStatusAction } from "@/app/clients/actions";
import { AppShell } from "@/components/app-shell";
import { ClientStatus, CreditRating } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const ratingLabel: Record<CreditRating, string> = {
  NEW: "Nuevo",
  GOOD: "Bueno",
  WATCH: "Observacion",
  RISKY: "Riesgoso",
  BAD: "Malo",
};

const statusLabel: Record<ClientStatus, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  BLOCKED: "Bloqueado",
};

type ClientsPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const user = await requireSession();
  const { q } = await searchParams;
  const query = q?.trim();

  const clients = await prisma.client.findMany({
    where: query
      ? {
          OR: [
            { fullName: { contains: query, mode: "insensitive" } },
            { identityNumber: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
            { businessName: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: [{ status: "asc" }, { fullName: "asc" }],
    select: {
      id: true,
      fullName: true,
      identityNumber: true,
      phone: true,
      address: true,
      businessName: true,
      businessAddress: true,
      status: true,
      creditRating: true,
      notes: true,
      createdAt: true,
      _count: {
        select: {
          loans: true,
          payments: true,
        },
      },
    },
  });

  const activeClients = clients.filter(
    (client) => client.status === ClientStatus.ACTIVE,
  ).length;
  const blockedClients = clients.filter(
    (client) => client.status === ClientStatus.BLOCKED,
  ).length;

  return (
    <AppShell
      description="Registro, búsqueda, estado y calificación crediticia de la cartera."
      eyebrow="Cartera de clientes"
      title="Clientes"
      user={user}
    >
      <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold">Crear cliente</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Estos datos alimentaran prestamos, rutas, cobros e historial
            crediticio.
          </p>
          <div className="mt-4">
            <ClientForm mode="create" />
          </div>
        </aside>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-base font-semibold">Lista de clientes</h2>
              <p className="mt-1 text-sm text-slate-600">
                {clients.length} resultados, {activeClients} activos,{" "}
                {blockedClients} bloqueados.
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
            {clients.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <Users className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-3 text-sm font-medium text-slate-700">
                  No hay clientes para mostrar.
                </p>
              </div>
            ) : null}

            {clients.map((client) => (
              <article
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                key={client.id}
              >
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold">
                        {client.fullName}
                      </h3>
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-medium ring-1 ${
                          client.status === ClientStatus.ACTIVE
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                            : client.status === ClientStatus.BLOCKED
                              ? "bg-rose-50 text-rose-700 ring-rose-200"
                              : "bg-slate-100 text-slate-600 ring-slate-200"
                        }`}
                      >
                        {statusLabel[client.status]}
                      </span>
                      <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                        {ratingLabel[client.creditRating]}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {client.identityNumber || "Sin identidad"} /{" "}
                      {client.phone || "Sin telefono"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {client.businessName || client.address || "Sin negocio o direccion"}
                    </p>
                    <p className="mt-2 text-xs font-medium text-slate-500">
                      {client._count.loans} prestamos / {client._count.payments}{" "}
                      pagos
                    </p>
                  </div>

                  <form action={setClientStatusAction}>
                    <input name="clientId" type="hidden" value={client.id} />
                    <button
                      className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      type="submit"
                    >
                      {client.status === ClientStatus.ACTIVE
                        ? "Desactivar"
                        : "Activar"}
                    </button>
                  </form>
                </div>

                <details className="mt-3 rounded-md border border-slate-200 bg-white">
                  <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-slate-700">
                    Editar datos
                  </summary>
                  <div className="border-t border-slate-200 p-3">
                    <ClientForm client={client} mode="edit" />
                  </div>
                </details>
              </article>
            ))}
          </div>
        </section>
      </section>
    </AppShell>
  );
}
