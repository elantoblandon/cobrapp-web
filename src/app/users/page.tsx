import Link from "next/link";
import { ArrowLeft, ShieldCheck, UserCog } from "lucide-react";
import { setUserStatusAction } from "@/app/users/actions";
import { CreateUserForm } from "@/app/users/create-user-form";
import { PasswordForm } from "@/app/users/password-form";
import { UserStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export default async function UsersPage() {
  const currentUser = await requireAdmin();
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  const activeCollectors = users.filter(
    (user) => user.role === "COLLECTOR" && user.status === "ACTIVE",
  ).length;

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
                Seguridad y accesos
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-normal sm:text-3xl">
                Usuarios del negocio
              </h1>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              {currentUser.name} / ADMIN
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[420px_1fr] lg:px-8">
        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold">Crear usuario</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Los cobradores solo veran rutas, clientes y caja asignados cuando
            construyamos esos modulos.
          </p>
          <div className="mt-4">
            <CreateUserForm />
          </div>
        </aside>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold">Lista de usuarios</h2>
              <p className="mt-1 text-sm text-slate-600">
                {users.length} usuarios, {activeCollectors} cobradores activos.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
              <UserCog className="h-4 w-4" />
              Roles ADMIN / COLLECTOR
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {users.map((user) => (
              <article
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                key={user.id}
              >
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold">{user.name}</h3>
                      <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                        {user.role}
                      </span>
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-medium ring-1 ${
                          user.status === UserStatus.ACTIVE
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                            : "bg-slate-100 text-slate-600 ring-slate-200"
                        }`}
                      >
                        {user.status === UserStatus.ACTIVE
                          ? "Activo"
                          : "Inactivo"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{user.email}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {user.phone || "Sin telefono registrado"}
                    </p>
                  </div>

                  <form action={setUserStatusAction}>
                    <input name="userId" type="hidden" value={user.id} />
                    <button
                      className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={user.id === currentUser.id}
                      type="submit"
                    >
                      {user.status === UserStatus.ACTIVE
                        ? "Desactivar"
                        : "Activar"}
                    </button>
                  </form>
                </div>

                <PasswordForm userId={user.id} />
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
