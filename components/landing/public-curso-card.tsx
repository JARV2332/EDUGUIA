import type { PublicCursoCard } from "@/lib/lms/get-public-cursos";
import { buildComprarCursoWhatsAppUrl } from "@/lib/landing/whatsapp-compra";

export function PublicCursoCardView({ curso }: { curso: PublicCursoCard }) {
  const whatsappUrl = buildComprarCursoWhatsAppUrl(curso);

  return (
    <article className="course-card">
      <div className="course-card__image">
        <img src={curso.imagen_url} alt={curso.titulo} loading="lazy" />
      </div>
      <div className="course-card__body">
        <h3 className="course-card__title">{curso.titulo}</h3>
        {curso.edad && (
          <p className="course-card__meta">
            <strong>Dirigido a:</strong> {curso.edad}
          </p>
        )}
        {curso.inversion ? (
          <p className="course-card__meta">
            <strong>Inversión:</strong> {curso.inversion}
          </p>
        ) : curso.duracion ? (
          <p className="course-card__meta">
            <strong>Duración:</strong> {curso.duracion}
          </p>
        ) : null}
        {curso.modalidad && (
          <p className="course-card__meta">
            <strong>Modalidad:</strong> {curso.modalidad}
          </p>
        )}
        {curso.descripcion && <p className="course-card__desc">{curso.descripcion}</p>}
        <a
          className="btn-primary course-card__cta"
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Comprar curso ${curso.titulo} por WhatsApp`}
        >
          <i className="fab fa-whatsapp" aria-hidden="true"></i>
          Comprar curso
        </a>
      </div>
    </article>
  );
}
