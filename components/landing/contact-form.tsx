"use client";

import { useState } from "react";
import { CONTACT_SUBJECT_LABELS } from "@/lib/landing/whatsapp";

type FormStatus = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      subject: String(data.get("subject") ?? ""),
      message: String(data.get("message") ?? ""),
    };

    setStatus("sending");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (res.ok) {
        setStatus("success");
        form.reset();
        return;
      }

      setStatus("error");
      setErrorMessage(result.error || "No se pudo enviar tu mensaje. Intenta de nuevo o escríbenos por WhatsApp.");
    } catch {
      setStatus("error");
      setErrorMessage("Error de conexión. Verifica tu internet e intenta de nuevo.");
    }
  }

  return (
    <section className="contact-form-section" aria-labelledby="contact-form-title">
      <h2 id="contact-form-title" className="contact-form-section__title">
        Envíanos un mensaje
      </h2>
      <p className="contact-form-section__hint">Completa el formulario y nos pondremos en contacto contigo pronto.</p>

      <form className="contact-form" onSubmit={(e) => void handleSubmit(e)} noValidate>
        <div className="contact-form__row">
          <div className="contact-form__group">
            <label htmlFor="contact-name">
              Nombre completo <span aria-hidden="true">*</span>
            </label>
            <input type="text" id="contact-name" name="name" required autoComplete="name" placeholder="Tu nombre" />
          </div>
          <div className="contact-form__group">
            <label htmlFor="contact-email">
              Correo electrónico <span aria-hidden="true">*</span>
            </label>
            <input type="email" id="contact-email" name="email" required autoComplete="email" placeholder="tu@correo.com" />
          </div>
        </div>

        <div className="contact-form__row">
          <div className="contact-form__group">
            <label htmlFor="contact-phone">Teléfono</label>
            <input type="tel" id="contact-phone" name="phone" autoComplete="tel" placeholder="502 0000 0000" />
          </div>
          <div className="contact-form__group">
            <label htmlFor="contact-subject">
              Motivo de contacto <span aria-hidden="true">*</span>
            </label>
            <select id="contact-subject" name="subject" required defaultValue="">
              <option value="" disabled>
                Selecciona una opción
              </option>
              {Object.entries(CONTACT_SUBJECT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="contact-form__group">
          <label htmlFor="contact-message">
            Mensaje <span aria-hidden="true">*</span>
          </label>
          <textarea id="contact-message" name="message" rows={5} required placeholder="Cuéntanos en qué podemos ayudarte…" />
        </div>

        <button type="submit" className="btn-primary contact-form__submit" disabled={status === "sending"}>
          {status === "sending" ? "Enviando…" : "Enviar mensaje"}
        </button>

        {status === "sending" && (
          <p className="contact-form__notice" role="status">
            Enviando…
          </p>
        )}
        {status === "success" && (
          <p className="contact-form__notice contact-form__notice--success" role="status">
            ¡Gracias! Recibimos tu mensaje. Te responderemos lo antes posible.
          </p>
        )}
        {status === "error" && (
          <p className="contact-form__notice contact-form__notice--error" role="status">
            {errorMessage}
          </p>
        )}
      </form>
    </section>
  );
}
