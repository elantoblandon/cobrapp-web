"use client";

import { type FormEvent, useActionState, useState } from "react";
import { CircleDollarSign } from "lucide-react";
import { PaymentMethod } from "@/generated/prisma/enums";
import {
  registerPaymentAction,
  type PaymentFormState,
} from "@/app/payments/actions";
import { addOfflinePayment } from "@/lib/offline-payments";

const initialState: PaymentFormState = {};

type PaymentFormProps = {
  installmentId: string;
  maxAmount: string;
};

export function PaymentForm({ installmentId, maxAmount }: PaymentFormProps) {
  const [state, formAction, isPending] = useActionState(
    registerPaymentAction,
    initialState,
  );
  const [offlineMessage, setOfflineMessage] = useState<string>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (navigator.onLine) {
      return;
    }

    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const amount = Number(formData.get("amount"));
    const paidAt = String(formData.get("paidAt") ?? "");

    if (!amount || amount <= 0 || !paidAt) {
      setOfflineMessage("Completa monto y fecha antes de guardar offline.");
      return;
    }

    addOfflinePayment({
      offlineKey: crypto.randomUUID(),
      installmentId,
      amountCents: Math.round(amount * 100),
      method: String(formData.get("method")) as PaymentMethod,
      paidAt: new Date(`${paidAt}T12:00:00.000Z`).toISOString(),
      notes: String(formData.get("notes") ?? "").trim() || undefined,
      createdAt: new Date().toISOString(),
    });

    form.reset();
    setOfflineMessage("Pago guardado offline. Se sincronizara al reconectar.");
  }

  return (
    <form
      action={formAction}
      className="mt-3 grid gap-2 sm:grid-cols-4"
      onSubmit={handleSubmit}
    >
      <input name="installmentId" type="hidden" value={installmentId} />
      <input
        className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        max={maxAmount}
        min="0.01"
        name="amount"
        placeholder="Monto"
        required
        step="0.01"
        type="number"
      />
      <select
        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        defaultValue={PaymentMethod.CASH}
        name="method"
      >
        <option value={PaymentMethod.CASH}>Efectivo</option>
        <option value={PaymentMethod.TRANSFER}>Transferencia</option>
        <option value={PaymentMethod.OTHER}>Otro</option>
      </select>
      <input
        className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        name="paidAt"
        required
        type="date"
      />
      <button
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-700 px-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isPending}
        type="submit"
      >
        <CircleDollarSign className="h-4 w-4" />
        {isPending ? "Guardando..." : "Cobrar"}
      </button>
      <textarea
        className="min-h-16 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 sm:col-span-4"
        name="notes"
        placeholder="Nota opcional"
      />
      {offlineMessage || state.error || state.success ? (
        <p
          className={`rounded-md border px-3 py-2 text-sm sm:col-span-4 ${
            state.error
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {offlineMessage ?? state.error ?? state.success}
        </p>
      ) : null}
    </form>
  );
}
