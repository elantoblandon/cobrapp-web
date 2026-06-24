"use client";

import { useActionState } from "react";
import { Save, UserPlus } from "lucide-react";
import { ClientStatus, CreditRating } from "@/generated/prisma/enums";
import {
  createClientAction,
  updateClientAction,
  type ClientFormState,
} from "@/app/clients/actions";

const initialState: ClientFormState = {};

type ClientFormProps = {
  mode: "create" | "edit";
  client?: {
    id: string;
    fullName: string;
    identityNumber: string | null;
    phone: string | null;
    address: string | null;
    businessName: string | null;
    businessAddress: string | null;
    status: ClientStatus;
    creditRating: CreditRating;
    notes: string | null;
  };
};

export function ClientForm({ mode, client }: ClientFormProps) {
  const action = mode === "create" ? createClientAction : updateClientAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const isEdit = mode === "edit";

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      {client ? <input name="clientId" type="hidden" value={client.id} /> : null}

      <div className="md:col-span-2">
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor={`${mode}-fullName`}
        >
          Nombre completo
        </label>
        <input
          className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          defaultValue={client?.fullName}
          id={`${mode}-fullName`}
          name="fullName"
          required
        />
      </div>

      <div>
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor={`${mode}-identityNumber`}
        >
          Identidad
        </label>
        <input
          className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          defaultValue={client?.identityNumber ?? ""}
          id={`${mode}-identityNumber`}
          name="identityNumber"
        />
      </div>

      <div>
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor={`${mode}-phone`}
        >
          Telefono
        </label>
        <input
          className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          defaultValue={client?.phone ?? ""}
          id={`${mode}-phone`}
          name="phone"
        />
      </div>

      <div className="md:col-span-2">
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor={`${mode}-address`}
        >
          Direccion
        </label>
        <input
          className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          defaultValue={client?.address ?? ""}
          id={`${mode}-address`}
          name="address"
        />
      </div>

      <div>
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor={`${mode}-businessName`}
        >
          Negocio
        </label>
        <input
          className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          defaultValue={client?.businessName ?? ""}
          id={`${mode}-businessName`}
          name="businessName"
        />
      </div>

      <div>
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor={`${mode}-businessAddress`}
        >
          Direccion negocio
        </label>
        <input
          className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          defaultValue={client?.businessAddress ?? ""}
          id={`${mode}-businessAddress`}
          name="businessAddress"
        />
      </div>

      <div>
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor={`${mode}-creditRating`}
        >
          Calificacion
        </label>
        <select
          className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          defaultValue={client?.creditRating ?? CreditRating.NEW}
          id={`${mode}-creditRating`}
          name="creditRating"
        >
          <option value={CreditRating.NEW}>Nuevo</option>
          <option value={CreditRating.GOOD}>Bueno</option>
          <option value={CreditRating.WATCH}>Observacion</option>
          <option value={CreditRating.RISKY}>Riesgoso</option>
          <option value={CreditRating.BAD}>Malo</option>
        </select>
      </div>

      {isEdit ? (
        <div>
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor={`${mode}-status`}
          >
            Estado
          </label>
          <select
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            defaultValue={client?.status ?? ClientStatus.ACTIVE}
            id={`${mode}-status`}
            name="status"
          >
            <option value={ClientStatus.ACTIVE}>Activo</option>
            <option value={ClientStatus.INACTIVE}>Inactivo</option>
            <option value={ClientStatus.BLOCKED}>Bloqueado</option>
          </select>
        </div>
      ) : null}

      <div className="md:col-span-2">
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor={`${mode}-notes`}
        >
          Notas
        </label>
        <textarea
          className="mt-2 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          defaultValue={client?.notes ?? ""}
          id={`${mode}-notes`}
          name="notes"
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
        {isEdit ? <Save className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
        {isPending
          ? isEdit
            ? "Guardando..."
            : "Creando..."
          : isEdit
            ? "Guardar cambios"
            : "Crear cliente"}
      </button>
    </form>
  );
}
