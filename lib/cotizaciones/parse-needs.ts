import { GROQ_MODEL } from "@/lib/ai/groq";
import type { QuoteNeed } from "@/lib/cotizaciones/types";

function extractJsonObject(text: string): string | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = (fenced?.[1] ?? text).trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return raw.slice(start, end + 1);
}

function normalizeNeeds(items: unknown): QuoteNeed[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      const row = item as { query?: unknown; cantidad?: unknown; notas?: unknown };
      const query = typeof row.query === "string" ? row.query.trim() : "";
      const cantidad = Number(row.cantidad);
      return {
        query,
        cantidad: Number.isFinite(cantidad) && cantidad > 0 ? Math.round(cantidad) : 1,
        notas: typeof row.notas === "string" ? row.notas : undefined,
      };
    })
    .filter((item) => item.query.length > 1)
    .slice(0, 16);
}

function stripMetaPrefixes(text: string): string {
  return text
    .replace(/^leyenda del kit:\s*/gim, "")
    .replace(/^materiales\s*\/\s*pedido:\s*/gim, "")
    .trim();
}

export function parseNeedsHeuristic(prompt: string): {
  titulo: string;
  cliente: string;
  leyenda: string;
  descripcion: string;
  incluye: string;
  validez: string;
  notas: string;
  items: QuoteNeed[];
} {
  const cleaned = stripMetaPrefixes(prompt);
  const chunks = cleaned
    .split(/[,;\n]+|\s+y\s+/i)
    .map((part) => part.trim())
    .filter(Boolean);

  const items: QuoteNeed[] = [];
  for (const chunk of chunks) {
    const match = chunk.match(/^(?:(\d+)\s*[x×]?\s+)?(.+)$/i);
    if (!match) continue;
    const query = (match[2] ?? "")
      .replace(/^(de|del|la|el|un|una|unos|unas)\s+/i, "")
      .trim();
    if (query.length < 2) continue;
    if (
      /^(kit|paquete|cotizaci[oó]n|quiero|necesito|arma|genera|describe|para|leyenda|colegio|estudiante)/i.test(
        query
      )
    ) {
      continue;
    }
    items.push({
      query,
      cantidad: match[1] ? Number.parseInt(match[1], 10) : 1,
    });
  }

  return {
    titulo: "Paquete de robótica",
    cliente: "",
    leyenda: cleaned.slice(0, 400),
    descripcion: "",
    incluye: "",
    validez: "15 días calendario",
    notas:
      "Precios en quetzales (GTQ). Sujeto a existencia en Electrónica DIY. No incluye IVA si aplica facturación especial. Entrega o armado del kit se coordina aparte.",
    items: items.slice(0, 16),
  };
}

export async function parseNeedsWithAi(
  prompt: string,
  leyenda?: string
): Promise<{
  titulo: string;
  cliente: string;
  leyenda: string;
  descripcion: string;
  incluye: string;
  validez: string;
  notas: string;
  items: QuoteNeed[];
  usedAi: boolean;
  aiError?: string;
}> {
  const fallback = parseNeedsHeuristic(prompt);
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey || apiKey.startsWith("your_")) {
    return { ...fallback, usedAi: false, aiError: "Falta GROQ_API_KEY" };
  }

  const userContent = [
    leyenda ? `Leyenda comercial (NO es un material): ${leyenda}` : "",
    `Materiales pedidos:\n${prompt}`,
    "Separa cada componente. Ejemplo: 10 Arduino UNO, 20 LEDs, protoboard, jumpers, 10 sensores ultrasónicos → 5 items.",
  ]
    .filter(Boolean)
    .join("\n\n");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.15,
      max_tokens: 1800,
      messages: [
        {
          role: "system",
          content:
            "Eres un cotizador comercial de EduKids GT (robótica educativa en Guatemala). Devuelve SOLO JSON válido, sin markdown. " +
            'Formato: {"titulo":"","cliente":"","descripcion":"","incluye":"","validez":"15 días calendario","notas":"","items":[{"query":"arduino uno","cantidad":10,"notas":""}]}. ' +
            "descripcion: 2 o 3 párrafos formales para la cotización (para quién es el kit, qué aprenden, cómo se usa). Conserva y AMPLÍA la leyenda del usuario, no la acortes. " +
            "incluye: viñetas separadas por salto de línea (qué trae el paquete a nivel pedagógico, no solo piezas). " +
            "Cada item es UN producto para Electrónica DIY. query corto. Nunca pongas la leyenda como item. Respeta cantidades. Máximo 16 items.",
        },
        { role: "user", content: userContent },
      ],
    }),
  });

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    return { ...fallback, usedAi: false, aiError: data.error?.message ?? `Groq ${response.status}` };
  }

  const content = data.choices?.[0]?.message?.content ?? "";
  const json = extractJsonObject(content);
  if (!json) return { ...fallback, usedAi: false, aiError: "La IA no devolvió JSON" };

  try {
    const parsed = JSON.parse(json) as {
      titulo?: unknown;
      cliente?: unknown;
      descripcion?: unknown;
      incluye?: unknown;
      validez?: unknown;
      notas?: unknown;
      items?: unknown;
    };
    const items = normalizeNeeds(parsed.items);
    if (!items.length) return { ...fallback, usedAi: true };
    const text = (value: unknown, backup: string) =>
      typeof value === "string" && value.trim() ? value.trim() : backup;
    return {
      titulo: text(parsed.titulo, fallback.titulo),
      cliente: text(parsed.cliente, ""),
      leyenda: leyenda || fallback.leyenda,
      descripcion: text(parsed.descripcion, leyenda || fallback.descripcion),
      incluye: text(parsed.incluye, fallback.incluye),
      validez: text(parsed.validez, fallback.validez),
      notas: text(parsed.notas, fallback.notas),
      items,
      usedAi: true,
    };
  } catch {
    return { ...fallback, usedAi: false, aiError: "JSON de IA inválido" };
  }
}
