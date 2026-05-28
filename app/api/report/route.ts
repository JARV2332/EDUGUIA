export const runtime = "nodejs";

import type { AssessmentData, ReportLanguageStored } from "@/lib/student-store";
import {
  aiResultsToReportSnapshot,
  buildReportGenerationPrompt,
  parseAIResultsJson,
} from "@/lib/generate-report";

const GROQ_MODEL = "llama-3.3-70b-versatile";

const systemPrompt = `Eres EduGuIA, experto en psicopedagogía inclusiva para Guatemala (DUA, contexto local).
Cuando te pidan un informe, devuelves ÚNICAMENTE JSON válido según la estructura indicada, sin markdown ni texto adicional.
No diagnostiques clínicamente; orienta con apoyos prácticos en aula y hogar.`;

export async function POST(req: Request) {
  const body = (await req.json()) as {
    assessmentData?: AssessmentData;
    reportLanguage?: ReportLanguageStored;
    language?: "es" | "en";
  };

  const assessmentData = body.assessmentData;
  if (!assessmentData?.studentName) {
    return new Response(JSON.stringify({ error: "Missing assessmentData" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const reportLanguage: ReportLanguageStored = body.reportLanguage ?? "es";
  const language = body.language === "en" ? "en" : "es";

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing GROQ_API_KEY" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const prompt = buildReportGenerationPrompt(assessmentData, reportLanguage, language);

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 4096,
      }),
    });

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    if (!response.ok) {
      const msg = data?.error?.message ?? "Groq API error";
      return new Response(JSON.stringify({ error: msg }), {
        status: response.status >= 400 ? response.status : 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const raw = data?.choices?.[0]?.message?.content?.trim() ?? "";
    const parsed = parseAIResultsJson(raw);

    if (!parsed) {
      return new Response(
        JSON.stringify({
          error:
            language === "es"
              ? "No se pudo interpretar el informe de la IA."
              : "Could not parse AI report.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const snapshot = aiResultsToReportSnapshot(parsed, reportLanguage);

    return new Response(JSON.stringify({ snapshot }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error en /api/report:", error);
    return new Response(
      JSON.stringify({
        error:
          language === "es"
            ? "Error al generar el informe."
            : "Report generation failed.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
