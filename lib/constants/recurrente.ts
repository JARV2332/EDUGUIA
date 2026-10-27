export const RECURRENTE_CLAVE_SCRIPT = "https://app.recurrente.com/clave/v1/clave.js";

/** Dominio autorizado en Recurrente para success/cancel (no usar localhost). */
const RECURRENTE_RETURN_ORIGIN =
  process.env.NEXT_PUBLIC_RECURRENTE_RETURN_URL?.replace(/\/$/, "") ?? "https://edukidsgt.com";

export function getRecurrenteAccountId(): string {
  return process.env.NEXT_PUBLIC_RECURRENTE_ACCOUNT?.trim() || "ac_kzp76tuk";
}

function recurrenteReturnOrigin(): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (site && !site.includes("localhost") && !site.includes("127.0.0.1")) return site;
  return RECURRENTE_RETURN_ORIGIN;
}

export function getRecurrenteSuccessUrl(): string {
  return `${recurrenteReturnOrigin()}/servicios/?pago=exito`;
}

export function getRecurrenteCancelUrl(): string {
  return `${recurrenteReturnOrigin()}/servicios/?pago=cancelado`;
}
/** Convierte precio en quetzales (ej. 225) a centavos para Recurrente. */
export function precioToAmountInCents(precio: number): number {
  return Math.round(precio * 100);
}
