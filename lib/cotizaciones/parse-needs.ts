import type { QuoteNeed } from "@/lib/cotizaciones/types";

const GROQ_MODEL = "llama-3.3-70b-versatile";

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
    .filter((item) => item.query.length > 0)
    .slice(0, 20);
}

export function parseNeedsHeuristic(prompt: string): {
  titulo: string;
  cliente: string;
  leyenda: string;
  notas: string;
  items: QuoteNeed[];
} {
  const chunks = prompt
    .split(/[,;\n]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const items: QuoteNeed[] = [];
  for (const chunk of chunks) {
    const match = chunk.match(/^(?:(\d+)\s*[x×]?\s+)?(.+)$/i);
    if (!match) continue;
    const query = (match[2] ?? "").replace(/^(de|del|la|el|un|una|unos|unas)\s+/i, "").trim();
    if (query.length < 2) continue;
    if (/^(kit|paquete|cotizaci[oó]n|quiero|necesito|arma|genera|describe|para)\b/i.test(query)) continue;
    items.push({
      query,
      cantidad: match[1] ? Number.parseInt(match[1], 10) : 1,
    });
  }

  return {
    titulo: "Paquete de robótica",
    cliente: "",
    leyenda: prompt.trim().slice(0, 400),
    notas: "",
    items: items.slice(0, 20),
  };
}

export async function parseNeedsWithAi(prompt: string): Promise<{
  titulo: string;
  cliente: string;
  leyenda: string;
  notas: string;
  items: QuoteNeed[];
  usedAi: boolean;
}> {
  const fallback = parseNeedsHeuristic(prompt);
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.startsWith("your_")) {
    return { ...fallback, usedAi: false };
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.2,
      max_tokens: 1200,
      messages: [
        {
          role: "system",
          content:
            "Eres un cotizador de kits de robótica educativa en Guatemala. Devuelve SOLO un objeto JSON válido, sin markdown. " +
            'Formato: {"titulo":"","cliente":"","leyenda":"","notas":"","items":[{"query":"arduino uno","cantidad":10,"notas":""}]}. ' +
            "query debe ser una frase corta para buscar en Electrónica DIY (placas, sensores, LEDs, cables, protoboard). " +
            "leyenda: resumen comercial del kit (para qué sirve, para cuántos alumnos). " +
            "Si el usuario da cantidades, respétalas. Máximo 16 items.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content ?? "";
  const json = extractJsonObject(content);
  if (!json) return { ...fallback, usedAi: false };

  try {
    const parsed = JSON.parse(json) as {
      titulo?: unknown;
      cliente?: unknown;
      leyenda?: unknown;
      notas?: unknown;
      items?: unknown;
    };
    const items = normalizeNeeds(parsed.items);
    if (!items.length) return { ...fallback, usedAi: true };
    return {
      titulo: typeof parsed.titulo === "string" && parsed.titulo.trim() ? parsed.titulo.trim() : fallback.titulo,
      cliente: typeof parsed.cliente === "string" ? parsed.cliente.trim() : "",
      leyenda: typeof parsed.leyenda === "string" && parsed.leyenda.trim() ? parsed.leyenda.trim() : fallback.leyenda,
      notas: typeof parsed.notas === "string" ? parsed.notas.trim() : "",
      items,
      usedAi: true,
    };
  } catch {
    return { ...fallback, usedAi: false };
  }
}
