import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChatMessage } from "@/components/chat/chat-message-list";

export type ChatSessionTipo = "assessment" | "followup";

export interface StoredChatMessage {
  role: "user" | "assistant";
  content: string;
  at: string;
}

export function storedMessagesToChatMessages(mensajes: unknown): ChatMessage[] {
  if (!Array.isArray(mensajes)) return [];
  return mensajes
    .filter(
      (m): m is StoredChatMessage =>
        !!m &&
        typeof m === "object" &&
        (m as StoredChatMessage).role !== undefined &&
        typeof (m as StoredChatMessage).content === "string"
    )
    .map((m) => ({ role: m.role, content: m.content.trim() }))
    .filter((m) => m.content.length > 0);
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

  return storedMessagesToChatMessages(data?.mensajes);
}
