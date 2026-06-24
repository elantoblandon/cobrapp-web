"use client";

import { useActionState } from "react";
import { MapPinned, UserPlus, Users } from "lucide-react";
import {
  assignClientAction,
  assignCollectorAction,
  createRouteAction,
  type RouteFormState,
} from "@/app/routes/actions";

const initialState: RouteFormState = {};

type Collector = {
  id: string;
  name: string;
};

type Client = {
  id: string;
  fullName: string;
  identityNumber: string | null;
};

export function CreateRouteForm() {
  const [state, formAction, isPending] = useActionState(
    createRouteAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="name">
          Nombre
        </label>
        <input
          className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          id="name"
          name="name"
          placeholder="Ruta Centro"
          required
        />
      </div>
      <div>
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="description"
        >
          Descripcion
        </label>
        <textarea
          className="mt-2 min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          id="description"
          name="description"
        />
      </div>
      {state.error || state.success ? (
        <p
          className={`rounded-md border px-3 py-2 text-sm ${
            state.error
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {state.error ?? state.success}
        </p>
      ) : null}
      <button
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isPending}
        type="submit"
      >
        <MapPinned className="h-4 w-4" />
        {isPending ? "Creando..." : "Crear ruta"}
      </button>
    </form>
  );
}

export function AssignCollectorForm({
  routeId,
  collectors,
}: {
  routeId: string;
  collectors: Collector[];
}) {
  const [state, formAction, isPending] = useActionState(
    assignCollectorAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-2">
      <input name="routeId" type="hidden" value={routeId} />
      <div className="flex gap-2">
        <select
          className="h-10 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          name="collectorId"
          required
        >
          <option value="">Cobrador</option>
          {collectors.map((collector) => (
            <option key={collector.id} value={collector.id}>
              {collector.name}
            </option>
          ))}
        </select>
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isPending || collectors.length === 0}
          type="submit"
        >
          <UserPlus className="h-4 w-4" />
          Asignar
        </button>
      </div>
      {state.error || state.success ? (
        <p className={state.error ? "text-sm text-rose-700" : "text-sm text-emerald-700"}>
          {state.error ?? state.success}
        </p>
      ) : null}
    </form>
  );
}

export function AssignClientForm({
  routeId,
  clients,
}: {
  routeId: string;
  clients: Client[];
}) {
  const [state, formAction, isPending] = useActionState(
    assignClientAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-2">
      <input name="routeId" type="hidden" value={routeId} />
      <div className="grid gap-2 sm:grid-cols-[1fr_90px_auto]">
        <select
          className="h-10 min-w-0 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          name="clientId"
          required
        >
          <option value="">Cliente</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.fullName}
              {client.identityNumber ? ` / ${client.identityNumber}` : ""}
            </option>
          ))}
        </select>
        <input
          className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          min="0"
          name="sortOrder"
          placeholder="Orden"
          type="number"
        />
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isPending || clients.length === 0}
          type="submit"
        >
          <Users className="h-4 w-4" />
          Agregar
        </button>
      </div>
      {state.error || state.success ? (
        <p className={state.error ? "text-sm text-rose-700" : "text-sm text-emerald-700"}>
          {state.error ?? state.success}
        </p>
      ) : null}
    </form>
  );
}
