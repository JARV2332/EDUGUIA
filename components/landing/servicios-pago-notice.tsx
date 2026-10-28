"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

function whatsappInscripcionUrl(): string {
  const text =
    "Hola EduKids, acabo de completar un pago en línea (Clave/Recurrente) y quiero confirmar la inscripción de mi hijo/a al curso. ¿Me pueden orientar con los siguientes pasos?";
  return `https://wa.me/50259886915?text=${encodeURIComponent(text)}`;
}

export function ServiciosPagoNotice() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pago = searchParams.get("pago");
  const noticeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (pago === "exito" && noticeRef.current) {
      noticeRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [pago]);

  if (pago !== "exito" && pago !== "cancelado") return null;

  const isSuccess = pago === "exito";

  function dismiss() {
    router.replace("/servicios/", { scroll: false });
  }

  return (
    <section
      ref={noticeRef}
      className={`pago-notice${isSuccess ? " pago-notice--success" : " pago-notice--cancel"}`}
      role="status"
      aria-live="polite"
      tabIndex={-1}
    >
      <div className="pago-notice__inner">
        <div className="pago-notice__text">
          {isSuccess ? (
            <>
              <h2 className="pago-notice__title">¡Pago recibido! Gracias por confiar en EduKids</h2>
              <p>
                Tu pago quedó <strong>registrado en Recurrente</strong>. Esto confirma tu intención de inscripción; nuestro
                equipo validará el cobro y te contactará pronto.
              </p>
              <ol className="pago-notice__steps">
                <li>
                  <strong>Confirmación:</strong> en 24–48 horas te escribimos al correo o teléfono del pago para confirmar
                  datos del estudiante.
                </li>
                <li>
                  <strong>Acceso al curso:</strong> te enviamos horarios, enlace de clases (si es virtual) e indicaciones de
                  materiales o kit, según el programa.
                </li>
                <li>
                  <strong>Comprobante:</strong> guarda el recibo que te envió Recurrente por correo; sirve como respaldo del
                  pago.
                </li>
              </ol>
              <p className="pago-notice__hint">
                ¿Necesitas ayuda ya? Escríbenos por WhatsApp con tu nombre y el curso que pagaste.
              </p>
              <div className="pago-notice__actions">
                <a className="btn-primary" href={whatsappInscripcionUrl()} target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-whatsapp" aria-hidden="true" /> Confirmar por WhatsApp
                </a>
                <Link className="pago-notice__link" href="/comunicate-con-nosotros/">
                  Ver contacto
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="pago-notice__title">El pago no se completó</h2>
              <p>
                Cerraste la ventana de pago o el cobro no finalizó. No se realizó ningún cargo. Puedes intentar de nuevo con{" "}
                <strong>Pagar con Clave</strong> en el curso que elijas o consultarnos por WhatsApp.
              </p>
              <div className="pago-notice__actions">
                <a className="btn-primary" href={whatsappInscripcionUrl()} target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-whatsapp" aria-hidden="true" /> Ayuda por WhatsApp
                </a>
              </div>
            </>
          )}
        </div>
        <button type="button" className="pago-notice__close" onClick={dismiss} aria-label="Cerrar aviso">
          ×
        </button>
      </div>
    </section>
  );
}
