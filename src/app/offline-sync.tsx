"use client";

import { useCallback, useEffect, useState } from "react";
import {
  readOfflinePayments,
  removeOfflinePayments,
} from "@/lib/offline-payments";

type SyncStatus = "idle" | "syncing" | "error";

export function OfflineSync() {
  const [pending, setPending] = useState(0);
  const [status, setStatus] = useState<SyncStatus>("idle");

  const refreshPending = useCallback(() => {
    setPending(readOfflinePayments().length);
  }, []);

  const syncPayments = useCallback(async () => {
    const payments = readOfflinePayments();

    if (!navigator.onLine || payments.length === 0) {
      refreshPending();
      return;
    }

    setStatus("syncing");

    try {
      const response = await fetch("/api/offline/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payments }),
      });

      if (!response.ok) {
        throw new Error("Sync failed");
      }

      const payload = (await response.json()) as {
        results: Array<{ offlineKey: string; ok: boolean }>;
      };
      const syncedKeys = payload.results
        .filter((result) => result.ok)
        .map((result) => result.offlineKey);

      removeOfflinePayments(syncedKeys);
      setStatus("idle");
      refreshPending();
    } catch {
      setStatus("error");
      refreshPending();
    }
  }, [refreshPending]);

  useEffect(() => {
    const handleChange = () => {
      refreshPending();
      void syncPayments();
    };

    window.addEventListener("online", syncPayments);
    window.addEventListener("focus", syncPayments);
    window.addEventListener("cobrapp:offline-payments-changed", handleChange);
    window.setTimeout(() => {
      refreshPending();
      void syncPayments();
    }, 0);

    return () => {
      window.removeEventListener("online", syncPayments);
      window.removeEventListener("focus", syncPayments);
      window.removeEventListener(
        "cobrapp:offline-payments-changed",
        handleChange,
      );
    };
  }, [refreshPending, syncPayments]);

  if (pending === 0 && status !== "syncing") {
    return null;
  }

  return (
    <div className="fixed bottom-3 left-3 right-3 z-50 mx-auto max-w-md rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 shadow-sm">
      {status === "syncing"
        ? "Sincronizando pagos offline..."
        : status === "error"
          ? `${pending} pagos pendientes. Se reintentara al reconectar.`
          : `${pending} pagos guardados offline.`}
    </div>
  );
}
