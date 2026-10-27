export const runtime = "nodejs";

import { createHash } from "crypto";

type SignBody = {
  reference?: string;
  amount_in_cents?: number;
  currency?: string;
};

function getSigningSecret(): string | null {
  const dedicated = process.env.RECURRENTE_SIGNATURE_KEY?.trim();
  if (dedicated) return dedicated;
  const legacy = process.env.RECURRENTE_SECRET_KEY?.trim();
  if (legacy?.startsWith("sig_")) return legacy;
  return null;
}

export async function POST(request: Request) {
  const secret = getSigningSecret();
  if (!secret) {
    return Response.json({ error: "Firma Recurrente no configurada" }, { status: 503 });
  }

  let body: SignBody;
  try {
    body = (await request.json()) as SignBody;
  } catch {
    return Response.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const reference = body.reference?.trim();
  const amount = Number(body.amount_in_cents);
  const currency = (body.currency?.trim() || "GTQ").toUpperCase();

  if (!reference || !Number.isFinite(amount) || amount <= 0) {
    return Response.json({ error: "Referencia o monto inválido" }, { status: 400 });
  }

  const signature = createHash("sha256")
    .update(`${reference}${Math.round(amount)}${currency}${secret}`)
    .digest("hex");

  return Response.json({ signature, reference, amount_in_cents: Math.round(amount), currency });
}
