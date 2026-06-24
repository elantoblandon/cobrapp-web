import { PaymentMethod } from "@/generated/prisma/enums";

export const OFFLINE_PAYMENTS_KEY = "cobrapp:offline-payments";

export type OfflinePayment = {
  offlineKey: string;
  installmentId: string;
  amountCents: number;
  method: PaymentMethod;
  paidAt: string;
  notes?: string;
  createdAt: string;
};

export function readOfflinePayments() {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(OFFLINE_PAYMENTS_KEY);

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as OfflinePayment[];
  } catch {
    return [];
  }
}

export function writeOfflinePayments(payments: OfflinePayment[]) {
  window.localStorage.setItem(OFFLINE_PAYMENTS_KEY, JSON.stringify(payments));
  window.dispatchEvent(new Event("cobrapp:offline-payments-changed"));
}

export function addOfflinePayment(payment: OfflinePayment) {
  const payments = readOfflinePayments();
  writeOfflinePayments([...payments, payment]);
}

export function removeOfflinePayments(keys: string[]) {
  const keySet = new Set(keys);
  const payments = readOfflinePayments().filter(
    (payment) => !keySet.has(payment.offlineKey),
  );
  writeOfflinePayments(payments);
}
