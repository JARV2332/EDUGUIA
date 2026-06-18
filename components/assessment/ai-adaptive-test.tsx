"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessageList, type ChatMessage } from "@/components/chat/chat-message-list";
import { useLanguage } from "@/contexts/language-context";
import { useAccessibility } from "@/contexts/accessibility-context";
import { Bot, Send, ArrowRight, Mic, Square } from "lucide-react";
import type { AssessmentData } from "@/app/assessment/page";

interface AIAdaptiveTestProps {
  data: AssessmentData;
  updateData: (updates: Partial<AssessmentData>) => void;
  onComplete: () => void;
  /** ID del estudiante en Supabase; si se envía, se usa historial y se guarda en planes_intervencion */
  estudianteId?: string | null;
}

export function AIAdaptiveTest({ data, updateData, onComplete, estudianteId }: AIAdaptiveTestProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { t } = useLanguage();
  const { speakText, stopSpeaking, isSpeaking } = useAccessibility();

  const toggleMic = () => {
    const SpeechRecognitionAPI =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition);
    if (!SpeechRecognitionAPI) {
      setSpeechError("Tu navegador no soporta reconocimiento de voz.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setIsListening(false);
      setSpeechError(null);
      return;
    }

    setSpeechError(null);
    const recognition = new SpeechRecognitionAPI() as SpeechRecognition;
    recognition.lang = "es-GT";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      const fullText = (finalTranscript + (interimTranscript ? " " + interimTranscript : "")).trim();
      if (fullText) setInput(fullText);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "not-allowed") {
        setSpeechError("Se necesita permiso del micrófono.");
        setIsListening(false);
      } else if (event.error !== "aborted") {
        setSpeechError("Error de reconocimiento. Intenta de nuevo.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch (err) {
      setSpeechError("No se pudo iniciar el micrófono. Comprueba el permiso.");
      setIsListening(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const buildPromptFromContext = (history: ChatMessage[]): string => {
    const name = data.studentName || "el estudiante";
    const age = data.studentAge || "no especificada";

    const sensorialSummary = `
- Agudeza visual: ${data.sensorial.visualImpairment}
- Audición: ${data.sensorial.hearingImpairment}
- Motricidad fina: ${data.sensorial.motorSkills}
- Tecnologías de apoyo: ${data.sensorial.assistiveTech.join(", ") || "ninguna reportada"}
`.trim();

    const neuroSummary = `
- Atención: ${data.neurodivergence.attention ? "presenta dificultades" : "sin dificultades reportadas"}
- Hiperactividad/impulsividad: ${data.neurodivergence.hyperactivity ? "presente" : "no reportada"}
- Interacción social: ${data.neurodivergence.socialInteraction ? "con retos" : "sin retos significativos reportados"}
- Ansiedad/regulación emocional: ${data.neurodivergence.anxiety ? "con indicadores" : "sin indicadores claros"}
- Sobrecarga sensorial: ${data.neurodivergence.sensoryOverload ? "presente" : "no reportada"}
- Notas adicionales: ${data.neurodivergence.additionalNotes || "no se añadieron notas adicionales"}
`.trim();

    const historyText =
      history.length === 0
        ? "Aún no hay historial de conversación."
        : history
            .map((m) => {
              const speaker = m.role === "user" ? "Usuario" : "Asistente";
              return `${speaker}: ${m.content}`;
            })
            .join("\n");

    return `
Datos del alumno:
- Nombre: ${name}
- Edad: ${age}

Resumen sensorial y físico:
${sensorialSummary}

Resumen de indicadores de neurodivergencia y conducta:
${neuroSummary}

Historial de la conversación hasta ahora:
${historyText}

Eres EduGuIA. Continúa la evaluación adaptativa con UNA sola intervención por turno:
- Un breve encuadre (opcional), orientación práctica si aporta, y **exactamente UNA pregunta** al docente al final.
- No repitas la misma pregunta ni dupliques bloques de "Evaluación adaptativa" o secciones Kaqchikel en el mismo mensaje.
Nunca des un diagnóstico; orienta con DUA y contexto de Guatemala.
Responde en el mismo idioma que usa el usuario (español salvo que pida otro).
    `.trim();
  };

  const startConversation = async (
    history: ChatMessage[],
    lastUserMessage?: string,
    signal?: AbortSignal
  ) => {
    setIsTyping(true);
    try {
      const prompt = buildPromptFromContext(history);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          estudiante_id: estudianteId ?? undefined,
          adaptive_chat: true,
          session_tipo: "assessment",
          chat_user_message: lastUserMessage,
        }),
        signal,
      });

      const dataResp = (await response.json()) as { reply?: string; error?: string };

      if (!response.ok || !dataResp.reply) {
        const friendlyError =
          dataResp.error ??
          "Hubo un problema al conectar con la IA. Intenta enviar de nuevo tu respuesta en unos momentos.";

        throw new Error(friendlyError);
      }
      const reply = dataResp.reply?.trim();

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      console.error(error);
      const message =
        error instanceof Error
          ? error.message
          : "Hubo un problema al conectar con la IA. Intenta enviar de nuevo tu respuesta en unos momentos.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: message,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    const ac = new AbortController();
    let cancelled = false;

    const bootstrap = async () => {
      setIsTyping(true);
      try {
        const prompt = buildPromptFromContext([]);
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            estudiante_id: estudianteId ?? undefined,
            adaptive_chat: true,
            session_tipo: "assessment",
          }),
          signal: ac.signal,
        });
        const dataResp = (await response.json()) as { reply?: string; error?: string };
        if (cancelled) return;
        if (!response.ok || !dataResp.reply) {
          throw new Error(
            dataResp.error ??
              "Hubo un problema al conectar con la IA. Intenta recargar el paso."
          );
        }
        const reply = dataResp.reply.trim();
        setMessages([{ role: "assistant", content: reply }]);
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        if (cancelled) return;
        const msg =
          e instanceof Error
            ? e.message
            : "Hubo un problema al conectar con la IA. Intenta recargar el paso.";
        setMessages([{ role: "assistant", content: msg }]);
      } finally {
        if (!cancelled) setIsTyping(false);
      }
    };

    void bootstrap();
    return () => {
      cancelled = true;
      ac.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar el paso 4; datos ya están en el primer render
  }, []);

  const handleSubmit = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput("");

    const lastAssistantMessage =
      [...messages].reverse().find((m) => m.role === "assistant")?.content || "";
    updateData({
      aiResponses: [
        ...data.aiResponses,
        { question: lastAssistantMessage, answer: userMessage },
      ],
    });

    const updatedHistory: ChatMessage[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(updatedHistory);

    await startConversation(updatedHistory, userMessage);
  };

  return (
    <Card className="flex min-h-0 w-full max-w-full flex-col overflow-hidden rounded-xl border border-border/80 bg-gradient-to-b from-card to-muted/20 shadow-md sm:h-[min(680px,90vh)] sm:max-h-[min(680px,90vh)] h-[min(720px,calc(100dvh-8rem))]">
      <CardHeader className="shrink-0 space-y-1 border-b bg-muted/30 px-4 pb-3 pt-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-sm">
            <Bot className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="leading-tight">{t("aiTest.title")}</span>
        </CardTitle>
        <CardDescription className="text-pretty pl-11 text-sm leading-snug sm:pl-11">
          {t("aiTest.subtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-0 px-3 pb-24 pt-3 sm:px-5 sm:pb-6 sm:pt-4">
        <div
          ref={scrollRef}
          className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain rounded-lg bg-muted/25 px-2 py-3 sm:px-3 sm:py-4 [-webkit-overflow-scrolling:touch]"
        >
          <ChatMessageList
            messages={messages}
            isTyping={isTyping}
            thinkingLabel={t("aiTest.thinking")}
            assistantLabel="EduGuIA"
            userLabel={t("aiTest.you")}
            readAloudLabel={t("results.readAloud")}
            isSpeaking={isSpeaking}
            onReadAloud={(plain) => {
              if (isSpeaking) stopSpeaking();
              else speakText(plain);
            }}
          />
        </div>

        <div className="mt-3 shrink-0 space-y-3 border-t pt-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("aiTest.placeholder")}
              rows={2}
              className="min-h-[52px] w-full resize-none text-base sm:min-h-[60px] sm:flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              aria-label={t("aiTest.placeholder")}
            />
            <div className="flex shrink-0 flex-row justify-end gap-2 sm:justify-start">
              <Button
                type="button"
                variant={isListening ? "destructive" : "outline"}
                size="icon"
                className="h-11 w-11 sm:h-[60px] sm:w-12"
                onClick={toggleMic}
                disabled={isTyping}
                aria-label={isListening ? "Detener micrófono" : "Dictar con micrófono"}
                title={isListening ? "Detener micrófono" : "Dictar (es-GT)"}
              >
                {isListening ? (
                  <Square className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>
              <Button
                type="submit"
                size="icon"
                className="h-11 w-11 sm:h-[60px] sm:w-12"
                disabled={!input.trim() || isTyping}
                aria-label={t("aiTest.send")}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
          {speechError && (
            <p className="text-sm text-destructive" role="alert">
              {speechError}
            </p>
          )}

          <Button
            onClick={onComplete}
            className="w-full pr-14 sm:pr-4"
            size="lg"
            disabled={messages.length === 0 || isTyping}
          >
            {t("aiTest.complete")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
