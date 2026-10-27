import { RecurrentePayActions } from "@/components/payments/recurrente-pay-actions";
import { buildComprarCursoWhatsAppUrl } from "@/lib/landing/whatsapp-compra";

type StaticCursoCardProps = {
  id: string;
  titulo: string;
  imagenUrl: string;
  imagenAlt: string;
  meta: { label: string; value: string }[];
  descripcion: string;
  amountInCents?: number;
};

export function StaticCursoCardView({
  id,
  titulo,
  imagenUrl,
  imagenAlt,
  meta,
  descripcion,
  amountInCents,
}: StaticCursoCardProps) {
  const whatsappUrl = buildComprarCursoWhatsAppUrl({
    titulo,
    duracion: meta.find((m) => m.label === "Duración")?.value,
    inversion: meta.find((m) => m.label === "Inversión")?.value,
  });
  const canPayOnline = amountInCents != null && amountInCents > 0;

  return (
    <article className="course-card">
      <div className="course-card__image">
        <img src={imagenUrl} alt={imagenAlt} loading="lazy" />
      </div>
      <div className="course-card__body">
        <h3 className="course-card__title">{titulo}</h3>
        {meta.map((row) => (
          <p key={row.label} className="course-card__meta">
            <strong>{row.label}:</strong> {row.value}
          </p>
        ))}
        <p className="course-card__desc">{descripcion}</p>
        <div className="course-card__actions">
          {canPayOnline && (
            <RecurrentePayActions
              cursoId={id}
              itemName={titulo}
              amountInCents={amountInCents}
              reference={id}
            />
          )}
          <a
            className={`btn-primary course-card__cta${canPayOnline ? " course-card__cta--secondary" : ""}`}
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-whatsapp" aria-hidden="true"></i>
            {canPayOnline ? "Consultar por WhatsApp" : "Comprar curso"}
          </a>
        </div>
      </div>
    </article>
  );
}
