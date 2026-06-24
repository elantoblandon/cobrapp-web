"use client";

import { useActionState } from "react";
import { Banknote } from "lucide-react";
import { PaymentFrequency } from "@/generated/prisma/enums";
import { createLoanAction, type LoanFormState } from "@/app/loans/actions";

const initialState: LoanFormState = {};

type LoanFormProps = {
  clients: Array<{
    id: string;
    fullName: string;
    identityNumber: string | null;
  }>;
};

export function LoanForm({ clients }: LoanFormProps) {
  const [state, formAction, isPending] = useActionState(
    createLoanAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4">
      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="clientId">
          Cliente
        </label>
        <select
          className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          id="clientId"
          name="clientId"
          required
        >
          <option value="">Seleccionar cliente</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.fullName}
              {client.identityNumber ? ` / ${client.identityNumber}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="principalAmount"
          >
            Monto prestado
          </label>
          <input
            className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            id="principalAmount"
            min="0.01"
            name="principalAmount"
            placeholder="1000.00"
            required
            step="0.01"
            type="number"
          />
        </div>

        <div>
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="interestType"
          >
            Tipo de interes
          </label>
          <select
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            defaultValue="AMOUNT"
            id="interestType"
            name="interestType"
          >
            <option value="AMOUNT">Monto fijo</option>
            <option value="PERCENT">Porcentaje</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="interestValue"
          >
            Interes
          </label>
          <input
            className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            id="interestValue"
            min="0"
            name="interestValue"
            placeholder="200.00 o 20"
            required
            step="0.01"
            type="number"
          />
        </div>

        <div>
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="termInstallments"
          >
            Numero de cuotas
          </label>
          <input
            className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            id="termInstallments"
            min="1"
            name="termInstallments"
            placeholder="24"
            required
            type="number"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="frequency"
          >
            Modalidad
          </label>
          <select
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            defaultValue={PaymentFrequency.DAILY}
            id="frequency"
            name="frequency"
          >
            <option value={PaymentFrequency.DAILY}>Diario</option>
            <option value={PaymentFrequency.WEEKLY}>Semanal</option>
            <option value={PaymentFrequency.BIWEEKLY}>Quincenal</option>
            <option value={PaymentFrequency.MONTHLY}>Mensual</option>
          </select>
        </div>

        <div>
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="startDate"
          >
            Fecha de inicio
          </label>
          <input
            className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            id="startDate"
            name="startDate"
            required
            type="date"
          />
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            className="h-4 w-4 rounded border-slate-300 text-emerald-700"
            name="automaticLateFee"
            type="checkbox"
          />
          Aplicar mora automatica
        </label>
        <input
          className="mt-3 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          min="0"
          name="lateFeeAmount"
          placeholder="Monto de mora opcional"
          step="0.01"
          type="number"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="notes">
          Notas
        </label>
        <textarea
          className="mt-2 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          id="notes"
          name="notes"
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
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isPending || clients.length === 0}
        type="submit"
      >
        <Banknote className="h-4 w-4" />
        {isPending ? "Creando..." : "Crear prestamo"}
      </button>
    </form>
  );
}
