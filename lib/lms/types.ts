export interface Curso {
  id: string;
  slug: string;
  titulo: string;
  descripcion: string | null;
  edad_min: number | null;
  edad_max: number | null;
  imagen_url: string | null;
  docente_id: string | null;
  publicado: boolean;
  created_at: string;
}

export interface Modulo {
  id: string;
  curso_id: string;
  titulo: string;
  descripcion: string | null;
  orden: number;
}

export interface Material {
  id: string;
  modulo_id: string;
  titulo: string;
  tipo: "video" | "pdf" | "link" | "texto" | "actividad";
  contenido: string | null;
  url: string | null;
  storage_path: string | null;
  orden: number;
}

export interface Tarea {
  id: string;
  modulo_id: string;
  titulo: string;
  instrucciones: string | null;
  fecha_entrega: string | null;
}

export interface Matricula {
  id: string;
  curso_id: string;
  alumno_id: string;
  estado: "activa" | "completada" | "suspendida";
  enrolled_at: string;
  cursos?: Curso;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "curso";
}
