import type { Curso } from "@/lib/lms/types";

export function formatEdadPublico(curso: Pick<Curso, "edad_publico" | "edad_min" | "edad_max">): string | null {
  if (curso.edad_publico?.trim()) return curso.edad_publico.trim();
  if (curso.edad_min != null && curso.edad_max != null) {
    return `${curso.edad_min} a ${curso.edad_max} años`;
  }
  if (curso.edad_min != null) return `Desde ${curso.edad_min} años`;
  if (curso.edad_max != null) return `Hasta ${curso.edad_max} años`;
  return null;
}

export function formatPrecio(curso: Pick<Curso, "precio" | "precio_moneda">): string | null {
  if (curso.precio == null) return null;
  const amount = Number(curso.precio);
  if (Number.isNaN(amount)) return null;
  const formatted = amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2);
  if (curso.precio_moneda === "GTQ") return `Q${formatted}`;
  return `${curso.precio_moneda} ${formatted}`;
}

export function formatInversionLine(curso: Pick<Curso, "precio" | "precio_moneda" | "duracion">): string | null {
  const precio = formatPrecio(curso);
  const partes: string[] = [];
  if (precio) partes.push(precio);
  if (curso.duracion?.trim()) partes.push(curso.duracion.trim());
  return partes.length ? partes.join(" · ") : null;
}

export function cursoImagenDefault(): string {
  return "/wp-content/uploads/2020/08/STEAMlogo_1024x1024.png";
}
