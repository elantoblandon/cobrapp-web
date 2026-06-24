import Link from "next/link";
import { ArrowLeft, MapPinned, Route as RouteIcon } from "lucide-react";
import {
  removeClientAssignmentAction,
  removeCollectorAssignmentAction,
  toggleRouteAction,
} from "@/app/routes/actions";
import {
  AssignClientForm,
  AssignCollectorForm,
  CreateRouteForm,
} from "@/app/routes/route-forms";
import { ClientStatus, UserRole, UserStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const dateFormatter = new Intl.DateTimeFormat("es-HN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(date: Date) {
  return dateFormatter.format(date);
}

export default async function RoutesPage() {
  const user = await requireAdmin();

  const [routes, collectors, clients] = await Promise.all([
    prisma.route.findMany({
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        createdAt: true,
        assignments: {
          where: { endsAt: null },
          orderBy: { startsAt: "desc" },
          select: {
            id: true,
            startsAt: true,
            collector: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        clients: {
          where: { endsAt: null },
          orderBy: [{ sortOrder: "asc" }, { startsAt: "asc" }],
          select: {
            id: true,
            sortOrder: true,
            startsAt: true,
            client: {
              select: {
                fullName: true,
                identityNumber: true,
                phone: true,
                businessName: true,
                _count: {
                  select: {
                    loans: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
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
    prisma.client.findMany({
      where: { status: ClientStatus.ACTIVE },
      orderBy: { fullName: "asc" },
      select: {
        id: true,
        fullName: true,
        identityNumber: true,
      },
    }),
  ]);

  const activeRoutes = routes.filter((route) => route.isActive).length;
  const assignedClients = routes.reduce(
    (total, route) => total + route.clients.length,
    0,
  );
  const assignedCollectors = routes.reduce(
    (total, route) => total + route.assignments.length,
    0,
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
                Zonas, rutas y cobradores
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-normal sm:text-3xl">
                Rutas
              </h1>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
              <MapPinned className="h-4 w-4 text-emerald-700" />
              {user.name} / ADMIN
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-950 shadow-sm">
            <p className="text-sm font-medium">Rutas activas</p>
            <p className="mt-3 text-2xl font-semibold">{activeRoutes}</p>
          </article>
          <article className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sky-950 shadow-sm">
            <p className="text-sm font-medium">Clientes asignados</p>
            <p className="mt-3 text-2xl font-semibold">{assignedClients}</p>
          </article>
          <article className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950 shadow-sm">
            <p className="text-sm font-medium">Cobradores en ruta</p>
            <p className="mt-3 text-2xl font-semibold">
              {assignedCollectors}
            </p>
          </article>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
          <aside className="h-fit rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold">Crear ruta</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Una ruta agrupa clientes y cobradores para organizar el trabajo
              diario de cobro.
            </p>
            <div className="mt-4">
              <CreateRouteForm />
            </div>
          </aside>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold">Lista de rutas</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {routes.length} rutas creadas.
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
                <RouteIcon className="h-4 w-4" />
                Asignaciones activas
              </span>
            </div>

            <div className="mt-4 space-y-4">
              {routes.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <MapPinned className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-3 text-sm font-medium text-slate-700">
                    No hay rutas para mostrar.
                  </p>
                </div>
              ) : null}

              {routes.map((route) => (
                <article
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  key={route.id}
                >
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold">{route.name}</h3>
                        <span
                          className={`rounded-md px-2 py-1 text-xs font-medium ring-1 ${
                            route.isActive
                              ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                              : "bg-slate-100 text-slate-600 ring-slate-200"
                          }`}
                        >
                          {route.isActive ? "Activa" : "Inactiva"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        {route.description || "Sin descripcion"}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        Creada el {formatDate(route.createdAt)}
                      </p>
                    </div>

                    <form action={toggleRouteAction}>
                      <input name="routeId" type="hidden" value={route.id} />
                      <button
                        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        type="submit"
                      >
                        {route.isActive ? "Desactivar" : "Activar"}
                      </button>
                    </form>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <section className="rounded-md border border-slate-200 bg-white p-3">
                      <h4 className="text-sm font-semibold">Cobradores</h4>
                      <div className="mt-3">
                        <AssignCollectorForm
                          collectors={collectors}
                          routeId={route.id}
                        />
                      </div>
                      <div className="mt-3 space-y-2">
                        {route.assignments.length === 0 ? (
                          <p className="text-sm text-slate-500">
                            Sin cobradores asignados.
                          </p>
                        ) : null}
                        {route.assignments.map((assignment) => (
                          <div
                            className="flex items-start justify-between gap-3 rounded-md bg-slate-50 p-3 ring-1 ring-slate-200"
                            key={assignment.id}
                          >
                            <div>
                              <p className="text-sm font-medium">
                                {assignment.collector.name}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {assignment.collector.email}
                              </p>
                            </div>
                            <form action={removeCollectorAssignmentAction}>
                              <input
                                name="routeAssignmentId"
                                type="hidden"
                                value={assignment.id}
                              />
                              <button
                                className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                                type="submit"
                              >
                                Quitar
                              </button>
                            </form>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="rounded-md border border-slate-200 bg-white p-3">
                      <h4 className="text-sm font-semibold">Clientes</h4>
                      <div className="mt-3">
                        <AssignClientForm clients={clients} routeId={route.id} />
                      </div>
                      <div className="mt-3 space-y-2">
                        {route.clients.length === 0 ? (
                          <p className="text-sm text-slate-500">
                            Sin clientes asignados.
                          </p>
                        ) : null}
                        {route.clients.map((routeClient) => (
                          <div
                            className="flex items-start justify-between gap-3 rounded-md bg-slate-50 p-3 ring-1 ring-slate-200"
                            key={routeClient.id}
                          >
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-medium">
                                  {routeClient.client.fullName}
                                </p>
                                <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                                  #{routeClient.sortOrder}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-slate-500">
                                {routeClient.client.identityNumber ||
                                  "Sin identidad"}{" "}
                                / {routeClient.client.phone || "Sin telefono"}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {routeClient.client.businessName ||
                                  "Sin negocio"}{" "}
                                / {routeClient.client._count.loans} prestamos
                              </p>
                            </div>
                            <form action={removeClientAssignmentAction}>
                              <input
                                name="routeClientId"
                                type="hidden"
                                value={routeClient.id}
                              />
                              <button
                                className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                                type="submit"
                              >
                                Quitar
                              </button>
                            </form>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
