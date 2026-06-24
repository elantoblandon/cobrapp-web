import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { LoginForm } from "@/app/login/login-form";
import { getSessionUser } from "@/lib/session";

export default async function LoginPage() {
  const user = await getSessionUser();

  if (user) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f4ee] px-4 py-10 text-slate-950">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-normal">
          Acceso a Cobrapp Web
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Ingresa con tu usuario administrador o cobrador para continuar.
        </p>
        <LoginForm />
      </section>
    </main>
  );
}
