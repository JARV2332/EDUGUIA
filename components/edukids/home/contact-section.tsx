"use client";

import { useState } from "react";
import { CONTACT_SUBJECT_LABELS } from "@/lib/landing/whatsapp";
import { edukidsWhatsAppUrl, FACEBOOK_URL } from "@/lib/edukids/content";

type FormStatus = "idle" | "sending" | "success" | "error";

const field =
  "w-full rounded-2xl border border-brand-darkblue/15 bg-white px-4 py-3 text-sm text-brand-darkblue outline-none focus:border-brand-cyan";

export function ContactSection({ facebookUrl }: { facebookUrl?: string | null }) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const facebook = facebookUrl || FACEBOOK_URL;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    setStatus("sending");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          phone: String(data.get("phone") ?? ""),
          subject: String(data.get("subject") ?? ""),
          message: String(data.get("message") ?? ""),
        }),
      });
      const result = await res.json();
      if (res.ok) {
        setStatus("success");
        form.reset();
        return;
      }
      setStatus("error");
      setErrorMessage(result.error || "No se pudo enviar tu mensaje. Escríbenos por WhatsApp.");
    } catch {
      setStatus("error");
      setErrorMessage("Error de conexión. Intenta de nuevo o escríbenos por WhatsApp.");
    }
  }

  return (
    <section id="contacto-home" className="scroll-mt-28 bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-cyan">Contacto</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-darkblue sm:text-4xl">Escríbenos</h2>
          <p className="mt-4 leading-relaxed text-brand-darkblue/75">
            Cuéntanos la edad, el colegio o el tipo de workshop. También puedes ir directo a WhatsApp o a la comunidad
            de Facebook.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={edukidsWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="ek-btn inline-flex rounded-full bg-brand-yellow px-5 py-3 text-sm font-bold text-brand-darkblue"
            >
              Escríbenos
            </a>
            <a
              href={facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="ek-btn inline-flex rounded-full bg-brand-darkblue px-5 py-3 text-sm font-bold text-white"
            >
              Comunidad en Facebook
            </a>
          </div>
        </div>

        <form className="ek-glow grid gap-4 bg-white p-6 sm:p-8" onSubmit={(event) => void handleSubmit(event)} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-semibold text-brand-darkblue">
              Nombre completo
              <input className={field} name="name" required autoComplete="name" placeholder="Tu nombre" />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-brand-darkblue">
              Correo
              <input className={field} type="email" name="email" required autoComplete="email" placeholder="tu@correo.com" />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-semibold text-brand-darkblue">
              Teléfono
              <input className={field} type="tel" name="phone" autoComplete="tel" placeholder="502 0000 0000" />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-brand-darkblue">
              Motivo
              <select className={field} name="subject" required defaultValue="">
                <option value="" disabled>
                  Selecciona una opción
                </option>
                {Object.entries(CONTACT_SUBJECT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="grid gap-1.5 text-sm font-semibold text-brand-darkblue">
            Mensaje
            <textarea className={field} name="message" rows={4} required placeholder="Cuéntanos en qué podemos ayudarte" />
          </label>
          <button
            type="submit"
            disabled={status === "sending"}
            className="ek-btn justify-self-start rounded-full bg-brand-cyan px-6 py-3 text-sm font-bold text-brand-darkblue disabled:opacity-60"
          >
            {status === "sending" ? "Enviando…" : "Enviar mensaje"}
          </button>
          {status === "success" && (
            <p className="text-sm font-semibold text-brand-darkblue" role="status">
              Recibimos tu mensaje. Te responderemos lo antes posible.
            </p>
          )}
          {status === "error" && (
            <p className="text-sm font-semibold text-brand-coral" role="status">
              {errorMessage}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
