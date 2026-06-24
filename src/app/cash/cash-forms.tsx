"use client";

import { useActionState } from "react";
import { LockKeyhole, Plus, WalletCards } from "lucide-react";
import {
  addExpenseAction,
  closeCashSessionAction,
  openCashSessionAction,
  type CashFormState,
} from "@/app/cash/actions";

const initialState: CashFormState = {};

type Collector = {
  id: string;
  name: string;
};

export function OpenCashForm({ collectors }: { collectors: Collector[] }) {
  const [state, formAction, isPending] = useActionState(
    openCashSessionAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="collectorId">
          Cobrador
        </label>
        <select
          className="mt-2 h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 sm:h-11 sm:text-sm"
          id="collectorId"
          name="collectorId"
          required
        >
          <option value="">Seleccionar cobrador</option>
          {collectors.map((collector) => (
            <option key={collector.id} value={collector.id}>
              {collector.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="sessionDate">
            Fecha
          </label>
          <input
            className="mt-2 h-12 w-full rounded-md border border-slate-300 px-3 text-base outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 sm:h-11 sm:text-sm"
            id="sessionDate"
            name="sessionDate"
            required
            type="date"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="openingAmount">
            Dinero entregado
          </label>
          <input
            className="mt-2 h-12 w-full rounded-md border border-slate-300 px-3 text-base outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 sm:h-11 sm:text-sm"
            id="openingAmount"
            min="0"
            name="openingAmount"
            required
            step="0.01"
            type="number"
          />
        </div>
      </div>
      <textarea
        className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-base outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 sm:text-sm"
        name="notes"
        placeholder="Nota opcional"
      />
      <CashMessage state={state} />
      <button
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isPending || collectors.length === 0}
        type="submit"
      >
        <WalletCards className="h-4 w-4" />
        {isPending ? "Abriendo..." : "Abrir caja"}
      </button>
    </form>
  );
}

export function ExpenseForm({ cashSessionId }: { cashSessionId: string }) {
  const [state, formAction, isPending] = useActionState(
    addExpenseAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-3 grid gap-2 sm:grid-cols-3">
      <input name="cashSessionId" type="hidden" value={cashSessionId} />
      <input
        className="h-12 rounded-md border border-slate-300 px-3 text-base outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 sm:h-10 sm:text-sm"
        min="0.01"
        name="amount"
        placeholder="Monto"
        required
        step="0.01"
        type="number"
      />
      <input
        className="h-12 rounded-md border border-slate-300 px-3 text-base outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 sm:h-10 sm:text-sm"
        name="category"
        placeholder="Categoria"
        required
      />
      <button
        className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-base font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 sm:h-10 sm:text-sm"
        disabled={isPending}
        type="submit"
      >
        <Plus className="h-4 w-4" />
        Gasto
      </button>
      <input
        className="h-12 rounded-md border border-slate-300 px-3 text-base outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 sm:col-span-3 sm:h-10 sm:text-sm"
        name="description"
        placeholder="Descripcion opcional"
      />
      <div className="sm:col-span-3">
        <CashMessage state={state} />
      </div>
    </form>
  );
}

export function CloseCashForm({ cashSessionId }: { cashSessionId: string }) {
  const [state, formAction, isPending] = useActionState(
    closeCashSessionAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
      <input name="cashSessionId" type="hidden" value={cashSessionId} />
      <input
        className="h-12 rounded-md border border-slate-300 px-3 text-base outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 sm:h-10 sm:text-sm"
        min="0"
        name="countedAmount"
        placeholder="Efectivo contado"
        required
        step="0.01"
        type="number"
      />
      <button
        className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-slate-900 px-3 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 sm:h-10 sm:text-sm"
        disabled={isPending}
        type="submit"
      >
        <LockKeyhole className="h-4 w-4" />
        Cerrar
      </button>
      <textarea
        className="min-h-16 rounded-md border border-slate-300 px-3 py-2 text-base outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 sm:col-span-2 sm:text-sm"
        name="notes"
        placeholder="Nota de cierre opcional"
      />
      <div className="sm:col-span-2">
        <CashMessage state={state} />
      </div>
    </form>
  );
}

function CashMessage({ state }: { state: CashFormState }) {
  if (!state.error && !state.success) {
    return null;
  }

  return (
    <p
      className={`rounded-md border px-3 py-2 text-sm ${
        state.error
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {state.error ?? state.success}
    </p>
  );
}
