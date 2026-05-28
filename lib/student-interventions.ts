import type { AssessmentData } from "@/lib/student-store";
import type { ChatMessage } from "@/components/chat/chat-message-list";

export interface InterventionPlanRow {
  id: string;
  observacion_docente: string;
  respuesta_ia: string;
  created_at: string;
}

/** Convierte el chat de la evaluación adaptativa (pregunta/respuesta) a mensajes del UI. */
export function assessmentChatToMessages(
  aiResponses: AssessmentData["aiResponses"]
): ChatMessage[] {
  const messages: ChatMessage[] = [];
  for (const pair of aiResponses) {
    if (pair.question?.trim()) {
      messages.push({ role: "assistant", content: pair.question.trim() });
    }
    if (pair.answer?.trim()) {
      messages.push({ role: "user", content: pair.answer.trim() });
    }
  }
  return messages;
}

const FOLLOW_UP_PREFIX = "Seguimiento EDUGUIA:";

export function isFollowUpObservation(observacion: string): boolean {
  return observacion.trimStart().startsWith(FOLLOW_UP_PREFIX);
}

export function followUpObservationToUserMessage(observacion: string): string {
  const trimmed = observacion.trim();
  if (trimmed.startsWith(FOLLOW_UP_PREFIX)) {
    return trimmed.slice(FOLLOW_UP_PREFIX.length).trim();
  }
  return trimmed.length <= 500 ? trimmed : "";
}

/** Planes guardados como seguimiento (no el prompt completo de evaluación). */
export function interventionPlansToMessages(plans: InterventionPlanRow[]): ChatMessage[] {
  const messages: ChatMessage[] = [];
  for (const plan of plans) {
    const userText = followUpObservationToUserMessage(plan.observacion_docente ?? "");
    if (userText) {
      messages.push({ role: "user", content: userText });
    }
    if (plan.respuesta_ia?.trim()) {
      messages.push({ role: "assistant", content: plan.respuesta_ia.trim() });
    }
  }
  return messages;
}

export function buildFollowUpPrompt(
  data: AssessmentData,
  userMessage: string,
  language: "es" | "en"
): string {
  const name = data.studentName || (language === "es" ? "el estudiante" : "the student");
  const age = data.studentAge || (language === "es" ? "no especificada" : "not specified");
  return language === "es"
    ? `Seguimiento del estudiante ${name} (edad ${age}). El docente escribe:\n\n${userMessage}\n\nResponde con orientación práctica para el aula (DUA, Guatemala). Termina con una pregunta breve de seguimiento.`
    : `Follow-up for student ${name} (age ${age}). Teacher writes:\n\n${userMessage}\n\nRespond with practical classroom guidance (UDL, Guatemala). End with a brief follow-up question.`;
}

export function formatFollowUpObservation(userMessage: string): string {
  return `${FOLLOW_UP_PREFIX} ${userMessage.trim()}`;
}
