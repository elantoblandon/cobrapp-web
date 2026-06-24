"use client";

import { useActionState } from "react";
import { KeyRound } from "lucide-react";
import { updatePasswordAction, type PasswordState } from "@/app/users/actions";

const initialState: PasswordState = {};

type PasswordFormProps = {
  userId: string;
};

export function PasswordForm({ userId }: PasswordFormProps) {
  const [state, formAction, isPending] = useActionState(
    updatePasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-3 flex flex-col gap-2 sm:flex-row">
      <input name="userId" type="hidden" value={userId} />
      <input
        className="h-10 min-w-0 flex-1 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        name="password"
        placeholder="Nueva contrasena"
        required
        type="password"
      />
      <button
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isPending}
        type="submit"
      >
        <KeyRound className="h-4 w-4" />
        Cambiar
      </button>
      {state.error || state.success ? (
        <p
          className={`text-sm sm:self-center ${
            state.error ? "text-rose-700" : "text-emerald-700"
          }`}
        >
          {state.error ?? state.success}
        </p>
      ) : null}
    </form>
  );
}
