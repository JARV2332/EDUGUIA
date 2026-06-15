export const runtime = "nodejs";

import { createClient } from "@/lib/supabase/route-handler";

const GROQ_MODEL = "llama-3.3-70b-versatile";

const systemPromptBase = `Eres EduGuIA, un asistente experto en psicopedagogía bilingüe para el contexto escolar de Guatemala. Tu objetivo es apoyar a docentes a identificar dificultades de aprendizaje (basadas en criterios del DSM-5) y proponer estrategias del Diseño Universal para el Aprendizaje (DUA).

Lineamientos clave:

Contexto local: Tus ejemplos deben ser rurales y urbanos de Guatemala.

Pertinencia lingüística: Incluye **una sola** sección breve de **Vocabulario de apoyo** o **Consejo pedagógico** en Kaqchikel (no dupliques esa sección ni repitas el mismo bloque dos veces en un mismo mensaje).

Tono: Profesional, empático y práctico. Evita lenguaje demasiado clínico; habla para un docente que está en el aula.

Formato (cuando no te pidan JSON puro): una sola intervención coherente con markdown sencillo. Sé útil y completo (varios párrafos o viñetas si hace falta), pero **sin redundancia**: no repitas la misma pregunta, no generes dos bloques “Evaluación adaptativa” ni dos conclusiones paralelas en el mismo turno.

No diagnostiques de forma clínica; orienta y sugiere apoyos en aula y hogar.

Cuando el usuario o el contexto pidan expresamente devolver ÚNICAMENTE un objeto JSON, respeta esa instrucción y no añadas texto fuera del JSON ni bloques de código markdown.`;

export async function POST(req: Request) {
  const body = (await req.json()) as {
    prompt?: string;
    estudiante_id?: string;
    /** Turnos de chat evaluativo: refuerza una sola respuesta por llamada */
    adaptive_chat?: boolean;
    /** Texto corto para guardar en planes_intervencion (seguimiento en Progreso) */
    observacion_resumen?: string;
  };
  const { prompt, estudiante_id, adaptive_chat, observacion_resumen } = body;

  if (!prompt || typeof prompt !== "string") {
    return new Response(JSON.stringify({ error: "Missing prompt" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Missing GROQ_API_KEY on the server" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let historialContext = "";
  let docenteId: string | null = null;
  const supabase = await createClient();

  if (estudiante_id && typeof estudiante_id === "string" && supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: docente } = await supabase
        .from("docentes")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (docente?.id) {
        docenteId = docente.id;
        const { data: planes } = await supabase
          .from("planes_intervencion")
          .select("observacion_docente, respuesta_ia, created_at")
          .eq("estudiante_id", estudiante_id)
          .order("created_at", { ascending: false })
          .limit(5);
        if (planes?.length) {
          historialContext =
            "\n\n--- Historial de intervenciones anteriores para este estudiante (usa esto para dar seguimiento y no repetir lo mismo):\n" +
            planes
              .map(
                (p, i) =>
                  `[${i + 1}] Observación: ${(p.observacion_docente ?? "").slice(0, 300)}... Respuesta IA: ${(p.respuesta_ia ?? "").slice(0, 500)}...`
              )
              .join("\n");
        }
      }
    }
  }

  const adaptiveHint = adaptive_chat
    ? `

[Modo conversación por turnos]
- En este mensaje debes dar **una sola** respuesta del asistente.
- Termina con **una** pregunta clara al docente (no dos preguntas similares).
- **Una** sección Kaqchikel al final; no repitas títulos ni secciones.`
    : "";

  const systemPrompt = systemPromptBase + historialContext + adaptiveHint;

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
          {
            role: "user",
            content: ["Contexto y pregunta del usuario:", prompt].join("\n\n"),
          },
        ],
        temperature: adaptive_chat ? 0.45 : 0.6,
        max_tokens: adaptive_chat ? 2048 : 4096,
      }),
    });

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    if (!response.ok) {
      console.error("Groq API error:", JSON.stringify(data, null, 2));
      const msg = data?.error?.message ?? "Groq API returned an error";
      const isRate =
        response.status === 429 ||
        /rate|limit/i.test(msg);
      return new Response(
        JSON.stringify({
          error: isRate
            ? "El servicio de IA está saturado. Intenta de nuevo en unos minutos."
            : msg,
        }),
        {
          status: isRate ? 503 : response.status >= 400 ? response.status : 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const text = data?.choices?.[0]?.message?.content?.trim() ?? "";

    if (!text) {
      return new Response(
        JSON.stringify({ error: "Groq response was empty" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (estudiante_id && docenteId && supabase) {
      const observacion =
        typeof observacion_resumen === "string" && observacion_resumen.trim()
          ? observacion_resumen.trim()
          : prompt.slice(0, 2000);
      await supabase.from("planes_intervencion").insert({
        estudiante_id,
        docente_id: docenteId,
        observacion_docente: observacion,
        respuesta_ia: text,
      });
    }

    return new Response(JSON.stringify({ reply: text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error en /api/chat con Groq:", error);
    return new Response(
      JSON.stringify({
        error: "Chat generation failed",
        details: error?.message ?? "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

