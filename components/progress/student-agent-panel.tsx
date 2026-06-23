"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useAccessibility } from "@/contexts/accessibility-context";
import { ChatMessageList, type ChatMessage } from "@/components/chat/chat-message-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { loadMergedChatSessionMessages } from "@/lib/chat-sessions";
import type { AssessmentData } from "@/lib/student-store";
import {
  assessmentChatToMessages,
  buildFollowUpPrompt,
  formatFollowUpObservation,
} from "@/lib/student-interventions";

interface StudentAgentPanelProps {
  studentId: string;
  assessmentData: AssessmentData;
  onFollowUpSent?: (userMessage: string, assistantReply: string) => void;
}

export function StudentAgentPanel({
  studentId,
  assessmentData,
  onFollowUpSent,
}: StudentAgentPanelProps) {
  const { language, t } = useLanguage();
  const { speakText, stopSpeaking, isSpeaking } = useAccessibility();
  const lang = language === "es" ? "es" : "en";

  const [historyMessages, setHistoryMessages] = useState<ChatMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fallbackAssessment = useMemo(
    () => assessmentChatToMessages(assessmentData.aiResponses ?? []),
    [assessmentData.aiResponses]
  );

  const loadHistory = useCallback(async () => {
    if (!studentId) return;
    setLoadingHistory(true);
    try {
      const supabase = createClient();
      const merged = await loadMergedChatSessionMessages(supabase, studentId, lang);
      setHistoryMessages(merged.length > 0 ? merged : fallbackAssessment);
    } catch (err) {
      console.error("Error cargando historial de chat:", err);
      setHistoryMessages(fallbackAssessment);
    } finally {
      setLoadingHistory(false);
    }
  }, [studentId, lang, fallbackAssessment]);

  useEffect(() => {
    setPendingMessages([]);
    setInput("");
    void loadHistory();
  }, [loadHistory, studentId]);

  const allMessages = useMemo(
    () => [...historyMessages, ...pendingMessages],
    [historyMessages, pendingMessages]
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [allMessages, isTyping]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    setInput("");
    setPendingMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setIsTyping(true);

    try {
      const prompt = buildFollowUpPrompt(assessmentData, trimmed, lang);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          estudiante_id: studentId,
          adaptive_chat: true,
          session_tipo: "followup",
          chat_user_message: trimmed,
          observacion_resumen: formatFollowUpObservation(trimmed),
        }),
      });

      const dataResp = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok || !dataResp.reply) {
        throw new Error(dataResp.error ?? t("progress.chatError"));
      }

      const reply = dataResp.reply.trim();
      setPendingMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      onFollowUpSent?.(trimmed, reply);
      await loadHistory();
      setPendingMessages([]);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : t("progress.chatError");
      setPendingMessages((prev) => [...prev, { role: "assistant", content: message }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Card className="flex min-h-0 w-full max-w-full flex-col overflow-hidden">
      <CardHeader className="shrink-0 space-y-1 border-b bg-muted/20 px-4 pb-3 pt-4 sm:px-6">
        <CardTitle className="text-base sm:text-lg">{t("progress.assessmentChat")}</CardTitle>
        <CardDescription className="text-pretty text-sm">
          {language === "es"
            ? "Historial completo con EduGuIA. Puedes seguir escribiendo abajo para pedir más orientación."
            : "Full history with EduGuIA. Keep typing below for more guidance."}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-0 p-0">
        <div
          ref={scrollRef}
          className="min-h-[min(50vh,24rem)] max-h-[min(65vh,32rem)] flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-3 py-4 sm:px-5 [-webkit-overflow-scrolling:touch]"
        >
          {loadingHistory && allMessages.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("progress.loadingChat")}</p>
          ) : allMessages.length === 0 && !isTyping ? (
            <p className="text-sm text-muted-foreground">{t("progress.noAssessmentChat")}</p>
          ) : (
            <ChatMessageList
              messages={allMessages}
              isTyping={isTyping}
              thinkingLabel={language === "es" ? "Pensando…" : "Thinking…"}
              assistantLabel="EduGuIA"
              userLabel={language === "es" ? "Docente" : "Teacher"}
              onReadAloud={(text) => {
                if (isSpeaking) stopSpeaking();
                else speakText(text);
              }}
              isSpeaking={isSpeaking}
              readAloudLabel={t("results.readAloud")}
            />
          )}
        </div>

        <form
          className="shrink-0 border-t bg-background/95 p-3 sm:p-4"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSend();
          }}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("progress.followUpPlaceholder")}
              rows={2}
              className="min-h-[3.5rem] w-full resize-y text-base sm:min-h-[4rem] sm:flex-1"
              disabled={isTyping}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="h-11 w-full shrink-0 sm:h-auto sm:w-auto"
            >
              <Send className="mr-2 h-4 w-4" aria-hidden="true" />
              {t("progress.sendFollowUp")}
            </Button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">{t("progress.chatSavedCloud")}</p>
        </form>
      </CardContent>
    </Card>
  );
}
