"use client";

import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { createUserAction, type CreateUserState } from "@/app/users/actions";

const initialState: CreateUserState = {};

export function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(
    createUserAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="name">
          Nombre
        </label>
        <input
          className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          id="name"
          name="name"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="email">
          Correo
        </label>
        <input
          className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          id="email"
          name="email"
          required
          type="email"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="phone">
          Telefono
        </label>
        <input
          className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          id="phone"
          name="phone"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="role">
          Rol
        </label>
        <select
          className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          defaultValue="COLLECTOR"
          id="role"
          name="role"
        >
          <option value="COLLECTOR">Cobrador</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="password"
        >
          Contrasena inicial
        </label>
        <input
          className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          id="password"
          name="password"
          required
          type="password"
        />
      </div>

      {state.error || state.success ? (
        <p
          className={`rounded-md border px-3 py-2 text-sm md:col-span-2 ${
            state.error
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {state.error ?? state.success}
        </p>
      ) : null}

      <button
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2"
        disabled={isPending}
        type="submit"
      >
        <UserPlus className="h-4 w-4" />
        {isPending ? "Creando..." : "Crear usuario"}
      </button>
    </form>
  );
}
