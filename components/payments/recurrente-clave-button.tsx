"use client";

import { useEffect, useId, useRef, useState } from "react";
import { getRecurrenteAccountId, RECURRENTE_CLAVE_SCRIPT } from "@/lib/constants/recurrente";

type ClaveItem = {
  name: string;
  amount_in_cents: number;
  currency: string;
};

type ClaveButtonHandle = {
  update: (changes: Record<string, unknown>) => void;
  unmount: () => void;
};

declare global {
  interface Window {
    Clave?: {
      button: (
        target: string,
        options: {
          account: string;
          items: ClaveItem[];
          successUrl?: string;
          cancelUrl?: string;
          metadata?: Record<string, string>;
          reference?: string;
          signature?: string;
          onFailure?: (event: { message?: string }) => void;
        }
      ) => ClaveButtonHandle;
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadRecurrenteScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Clave) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${RECURRENTE_CLAVE_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Recurrente Clave")), { once: true });
      if (window.Clave) resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = RECURRENTE_CLAVE_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar Recurrente Clave"));
    document.body.appendChild(script);
  });

  return scriptPromise;
}

function clientReturnUrls() {
  const origin = window.location.origin.replace(/\/$/, "");
  return {
    successUrl: `${origin}/servicios/?pago=exito`,
    cancelUrl: `${origin}/servicios/?pago=cancelado`,
  };
}

export type RecurrenteClaveButtonProps = {
  cursoId: string;
  itemName: string;
  amountInCents: number;
  currency?: string;
  reference?: string;
};

export function RecurrenteClaveButton({
  cursoId,
  itemName,
  amountInCents,
  currency = "GTQ",
  reference,
}: RecurrenteClaveButtonProps) {
  const reactId = useId();
  const containerId = `recurrente-clave-${reactId.replace(/:/g, "")}`;
  const handleRef = useRef<ClaveButtonHandle | null>(null);
  const account = getRecurrenteAccountId();
  const paymentReference = reference ?? cursoId;
  const [claveError, setClaveError] = useState<string | null>(null);

  useEffect(() => {
    if (amountInCents <= 0) return;

    let cancelled = false;

    async function mountClave() {
      try {
        await loadRecurrenteScript();
        if (cancelled || !window.Clave) return;

        let signature: string | undefined;
        try {
          const signRes = await fetch("/api/public/recurrente/sign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reference: paymentReference,
              amount_in_cents: amountInCents,
              currency,
            }),
          });
          if (signRes.ok) {
            const signed = (await signRes.json()) as { signature?: string };
            signature = signed.signature;
          }
        } catch {
          /* botón funciona sin firma; el monto queda marcado como del navegador */
        }

        const { successUrl, cancelUrl } = clientReturnUrls();
        handleRef.current?.unmount();
        handleRef.current = window.Clave.button(`#${containerId}`, {
          account,
          items: [{ name: itemName, amount_in_cents: amountInCents, currency }],
          successUrl,
          cancelUrl,
          reference: paymentReference,
          signature,
          metadata: { curso_id: cursoId, source: "edukidsgt-servicios" },
          onFailure: (event) => {
            const msg =
              event.message ??
              "No se pudo cargar Clave. Agrega este dominio en Recurrente → Configuración → Botón Clave.";
            setClaveError(msg);
          },
        });
        setClaveError(null);
      } catch {
        setClaveError("No se pudo cargar el script de Recurrente Clave.");
      }
    }

    void mountClave();

    return () => {
      cancelled = true;
      handleRef.current?.unmount();
      handleRef.current = null;
    };
  }, [account, amountInCents, containerId, currency, cursoId, itemName, paymentReference]);

  if (amountInCents <= 0) return null;

  return (
    <div className="course-card__clave-wrap">
      <div id={containerId} className="course-card__recurrente" aria-label={`Pagar ${itemName} con Clave`} />
      {claveError && (
        <p className="course-card__pay-error" role="status">
          {claveError}
        </p>
      )}
    </div>
  );
}
