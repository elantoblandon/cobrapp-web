import Link from "next/link";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f4ee] px-4 text-slate-950">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-md bg-amber-50 text-amber-700 ring-1 ring-amber-100">
          <WifiOff className="h-6 w-6" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-normal">
          Sin conexion
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          La app esta instalada, pero esta pantalla necesita internet para
          consultar datos actualizados.
        </p>
        <Link
          className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800"
          href="/collector"
        >
          Reintentar
        </Link>
      </section>
    </main>
  );
}
