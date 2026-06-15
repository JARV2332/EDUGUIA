import { slugify } from "@/lib/lms/types";

export type CatalogInput = {
  titulo?: string;
  descripcion?: string | null;
  edad_min?: string | number | null;
  edad_max?: string | number | null;
  edad_publico?: string | null;
  precio?: string | number | null;
  duracion?: string | null;
  modalidad?: string | null;
  imagen_url?: string | null;
  orden_servicios?: string | number | null;
  publicado?: boolean;
};

export function parseOptionalNumber(value: string | number | null | undefined): number | null {
  if (value == null) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isNaN(n) ? null : n;
}

export function buildCatalogUpdate(body: CatalogInput) {
  const patch: Record<string, unknown> = {};
  if (body.titulo !== undefined) patch.titulo = body.titulo.trim();
  if (body.descripcion !== undefined) patch.descripcion = body.descripcion?.trim() || null;
  if (body.edad_min !== undefined) patch.edad_min = parseOptionalNumber(body.edad_min);
  if (body.edad_max !== undefined) patch.edad_max = parseOptionalNumber(body.edad_max);
  if (body.edad_publico !== undefined) patch.edad_publico = body.edad_publico?.trim() || null;
  if (body.precio !== undefined) patch.precio = parseOptionalNumber(body.precio);
  if (body.duracion !== undefined) patch.duracion = body.duracion?.trim() || null;
  if (body.modalidad !== undefined) patch.modalidad = body.modalidad?.trim() || null;
  if (body.imagen_url !== undefined) patch.imagen_url = body.imagen_url?.trim() || null;
  if (body.orden_servicios !== undefined) patch.orden_servicios = parseOptionalNumber(body.orden_servicios) ?? 0;
  if (body.publicado !== undefined) patch.publicado = body.publicado;
  return patch;
}

export function buildCreatePayload(body: CatalogInput) {
  if (!body.titulo?.trim()) {
    throw new Error("El título es obligatorio");
  }
  const slug = `${slugify(body.titulo)}-${Date.now().toString(36)}`;
  return {
    slug,
    titulo: body.titulo.trim(),
    descripcion: body.descripcion?.trim() || null,
    edad_min: parseOptionalNumber(body.edad_min),
    edad_max: parseOptionalNumber(body.edad_max),
    edad_publico: body.edad_publico?.trim() || null,
    precio: parseOptionalNumber(body.precio),
    duracion: body.duracion?.trim() || null,
    modalidad: body.modalidad?.trim() || null,
    imagen_url: body.imagen_url?.trim() || null,
    orden_servicios: parseOptionalNumber(body.orden_servicios) ?? 0,
    publicado: false,
  };
}

export function buildMinimalCreatePayload(body: CatalogInput) {
  if (!body.titulo?.trim()) {
    throw new Error("El título es obligatorio");
  }
  const slug = `${slugify(body.titulo)}-${Date.now().toString(36)}`;
  return {
    slug,
    titulo: body.titulo.trim(),
    descripcion: body.descripcion?.trim() || null,
    publicado: false,
  };
}
