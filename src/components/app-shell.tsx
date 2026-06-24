import Link from "next/link";
import {
  Banknote,
  LayoutDashboard,
  LogOut,
  MapPinned,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Users,
  WalletCards,
} from "lucide-react";
import { logoutAction } from "@/app/login/actions";
import type { SessionUser } from "@/lib/session";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Cobrador", href: "/collector", icon: Smartphone },
  { name: "Usuarios", href: "/users", icon: ShieldCheck },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Prestamos", href: "/loans", icon: Banknote },
  { name: "Rutas", href: "/routes", icon: MapPinned },
  { name: "Cobros", href: "/payments", icon: ReceiptText },
  { name: "Caja", href: "/cash", icon: WalletCards },
];

type AppShellProps = {
  user: SessionUser;
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function AppShell({
  user,
  eyebrow,
  title,
  description,
  children,
}: AppShellProps) {
  return (
    <main className="min-h-screen bg-[#f5f7f4] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <div className="border-b border-slate-200 px-5 py-5">
              <Link className="flex items-center gap-3" href="/">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-700 text-sm font-bold text-white">
                  CW
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    Cobrapp Web
                  </p>
                  <p className="text-xs text-slate-500">Honduras / HNL</p>
                </div>
              </Link>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4">
              {navigation.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800"
                    href={item.href}
                    key={item.name}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-slate-200 p-4">
              <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
                <p className="text-sm font-semibold text-slate-950">
                  {user.name}
                </p>
                <p className="mt-1 text-xs text-slate-500">{user.role}</p>
              </div>
              <form action={logoutAction} className="mt-3">
                <button
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  type="submit"
                >
                  <LogOut className="h-4 w-4" />
                  Salir
                </button>
              </form>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700">
                    {eyebrow}
                  </p>
                  <h1 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">
                    {title}
                  </h1>
                  {description ? (
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                      {description}
                    </p>
                  ) : null}
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
                  {navigation.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Link
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800"
                        href={item.href}
                        key={item.name}
                        title={item.name}
                      >
                        <Icon className="h-4 w-4" />
                      </Link>
                    );
                  })}
                  <form action={logoutAction}>
                    <button
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                      title="Salir"
                      type="submit"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </header>

          <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
