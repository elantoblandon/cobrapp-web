"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { loginAction, type LoginState } from "@/app/login/actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="email"
        >
          Correo
        </label>
        <input
          autoComplete="email"
          className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          id="email"
          name="email"
          placeholder="admin@cobrapp.local"
          required
          type="email"
        />
      </div>

      <div>
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="password"
        >
          Contrasena
        </label>
        <input
          autoComplete="current-password"
          className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          id="password"
          name="password"
          required
          type="password"
        />
      </div>

      {state.error ? (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      <button
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isPending}
        type="submit"
      >
        <LogIn className="h-4 w-4" />
        {isPending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
