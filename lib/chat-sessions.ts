import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChatMessage } from "@/components/chat/chat-message-list";
import { formatAssistantChatContent } from "@/lib/format-chat-content";

export type ChatSessionTipo = "assessment" | "followup";

export interface StoredChatMessage {
  role: "user" | "assistant";
  content: string;
  at: string;
}

export function storedMessagesToChatMessages(
  mensajes: unknown,
  language: "es" | "en" = "es"
): ChatMessage[] {
  if (!Array.isArray(mensajes)) return [];
  return mensajes
    .filter(
      (m): m is StoredChatMessage =>
        !!m &&
        typeof m === "object" &&
        (m as StoredChatMessage).role !== undefined &&
        typeof (m as StoredChatMessage).content === "string"
    )
    .map((m) => ({
      role: m.role,
      content:
        m.role === "assistant"
          ? formatAssistantChatContent(m.content.trim(), language)
          : m.content.trim(),
    }))
    .filter((m) => m.content.length > 0);
}

function sortStoredMessages(mensajes: StoredChatMessage[]): StoredChatMessage[] {
  return [...mensajes].sort((a, b) => {
    const ta = a.at ? Date.parse(a.at) : 0;
    const tb = b.at ? Date.parse(b.at) : 0;
    if (ta !== tb) return ta - tb;
    return 0;
  });
}

/** Une evaluación + seguimiento en orden cronológico para la vista de progreso. */
export function mergeStoredChatSessions(
  assessmentRaw: unknown,
  followUpRaw: unknown,
  language: "es" | "en" = "es"
): ChatMessage[] {
  const collect = (raw: unknown): StoredChatMessage[] => {
    if (!Array.isArray(raw)) return [];
    return raw.filter(
      (m): m is StoredChatMessage =>
        !!m &&
        typeof m === "object" &&
        (m as StoredChatMessage).role !== undefined &&
        typeof (m as StoredChatMessage).content === "string"
    );
  };

  const merged = sortStoredMessages([...collect(assessmentRaw), ...collect(followUpRaw)]);
  return storedMessagesToChatMessages(merged, language);
}

export async function appendChatTurn(
  supabase: SupabaseClient,
  params: {
    estudianteId: string;
    docenteId: string;
    tipo: ChatSessionTipo;
    userMessage?: string;
    assistantMessage: string;
  }
): Promise<void> {
  const userContent = params.userMessage?.trim() ?? "";
  const assistantContent = params.assistantMessage.trim();
  if (!assistantContent && !userContent) return;

  const newMessages: StoredChatMessage[] = [];
  const at = new Date().toISOString();

  if (userContent) {
    newMessages.push({ role: "user", content: userContent, at });
  }
  if (assistantContent) {
    newMessages.push({ role: "assistant", content: assistantContent, at });
  }

  const { data: existing } = await supabase
    .from("sesiones_chat")
    .select("id, mensajes")
    .eq("estudiante_id", params.estudianteId)
    .eq("tipo", params.tipo)
    .maybeSingle();

  if (existing?.id) {
    const current = Array.isArray(existing.mensajes) ? (existing.mensajes as StoredChatMessage[]) : [];
    await supabase
      .from("sesiones_chat")
      .update({ mensajes: [...current, ...newMessages] })
      .eq("id", existing.id);
    return;
  }

  await supabase.from("sesiones_chat").insert({
    estudiante_id: params.estudianteId,
    docente_id: params.docenteId,
    tipo: params.tipo,
    mensajes: newMessages,
  });
}

export async function loadChatSessionMessages(
  supabase: SupabaseClient,
  estudianteId: string,
  tipo: ChatSessionTipo
): Promise<ChatMessage[]> {
  const { data } = await supabase
    .from("sesiones_chat")
    .select("mensajes")
    .eq("estudiante_id", estudianteId)
    .eq("tipo", tipo)
    .maybeSingle();

  return storedMessagesToChatMessages(data?.mensajes, "es");
}

export async function loadMergedChatSessionMessages(
  supabase: SupabaseClient,
  estudianteId: string,
  language: "es" | "en" = "es"
): Promise<ChatMessage[]> {
  const [{ data: assessment }, { data: followup }] = await Promise.all([
    supabase
      .from("sesiones_chat")
      .select("mensajes")
      .eq("estudiante_id", estudianteId)
      .eq("tipo", "assessment")
      .maybeSingle(),
    supabase
      .from("sesiones_chat")
      .select("mensajes")
      .eq("estudiante_id", estudianteId)
      .eq("tipo", "followup")
      .maybeSingle(),
  ]);

  return mergeStoredChatSessions(assessment?.mensajes, followup?.mensajes, language);
}
