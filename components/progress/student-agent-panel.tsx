"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useAccessibility } from "@/contexts/accessibility-context";
import { ChatMessageList, type ChatMessage } from "@/components/chat/chat-message-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import type { AssessmentData } from "@/lib/student-store";
import {
  assessmentChatToMessages,
  buildFollowUpPrompt,
  formatFollowUpObservation,
  interventionPlansToMessages,
  isFollowUpObservation,
  type InterventionPlanRow,
} from "@/lib/student-interventions";

function filterFollowUpPlans(plans: InterventionPlanRow[]): InterventionPlanRow[] {
  return plans.filter((p) => {
    const obs = p.observacion_docente ?? "";
    if (isFollowUpObservation(obs)) return true;
    if (obs.length > 600) return false;
    if (obs.includes("Eres EduGuIA") || obs.includes("evaluación adaptativa")) return false;
    return obs.trim().length > 0;
  });
}

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

  const [followUpPlans, setFollowUpPlans] = useState<InterventionPlanRow[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [pendingFollowUp, setPendingFollowUp] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const assessmentMessages = useMemo(
    () => assessmentChatToMessages(assessmentData.aiResponses ?? []),
    [assessmentData.aiResponses]
  );

  const savedFollowUpMessages = useMemo(
    () => interventionPlansToMessages(followUpPlans),
    [followUpPlans]
  );

  const followUpMessages = useMemo(
    () => [...savedFollowUpMessages, ...pendingFollowUp],
    [savedFollowUpMessages, pendingFollowUp]
  );

  const loadPlans = useCallback(async () => {
    if (!studentId) return;
    setLoadingPlans(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("planes_intervencion")
        .select("id, observacion_docente, respuesta_ia, created_at")
        .eq("estudiante_id", studentId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setFollowUpPlans(filterFollowUpPlans((data ?? []) as InterventionPlanRow[]));
    } catch (err) {
      console.error("Error cargando planes de intervención:", err);
      setFollowUpPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  }, [studentId]);

  useEffect(() => {
    setPendingFollowUp([]);
    setInput("");
    void loadPlans();
  }, [loadPlans, studentId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [assessmentMessages, followUpMessages, isTyping]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    setInput("");
    setPendingFollowUp((prev) => [...prev, { role: "user", content: trimmed }]);
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
          observacion_resumen: formatFollowUpObservation(trimmed),
        }),
      });

      const dataResp = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok || !dataResp.reply) {
        throw new Error(dataResp.error ?? t("progress.chatError"));
      }

      const reply = dataResp.reply.trim();
      setPendingFollowUp((prev) => [...prev, { role: "assistant", content: reply }]);
      onFollowUpSent?.(trimmed, reply);
      await loadPlans();
      setPendingFollowUp([]);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : t("progress.chatError");
      setPendingFollowUp((prev) => [
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

  const hasAssessmentChat = assessmentMessages.length > 0;

  return (
    <div className="space-y-6">
      {hasAssessmentChat ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t("progress.assessmentChat")}</CardTitle>
            <CardDescription>{t("progress.assessmentChatHint")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              ref={hasAssessmentChat ? undefined : scrollRef}
              className="max-h-[min(50vh,28rem)] overflow-y-auto rounded-lg border bg-muted/20 p-4"
            >
              <ChatMessageList
                messages={assessmentMessages}
                assistantLabel="EduGuIA"
                userLabel={language === "es" ? "Docente" : "Teacher"}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">{t("progress.noAssessmentChat")}</p>
      )}

      <Separator />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("progress.followUpChat")}</CardTitle>
          <CardDescription>{t("progress.followUpChatHint")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            ref={scrollRef}
            className="max-h-[min(50vh,28rem)] overflow-y-auto rounded-lg border bg-muted/20 p-4"
          >
            {loadingPlans && followUpMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("progress.loadingChat")}</p>
            ) : followUpMessages.length === 0 && !isTyping ? (
              <p className="text-sm text-muted-foreground">{t("progress.followUpEmpty")}</p>
            ) : (
              <ChatMessageList
                messages={followUpMessages}
                isTyping={isTyping}
                thinkingLabel={language === "es" ? "Pensando…" : "Thinking…"}
                assistantLabel="EduGuIA"
                userLabel={language === "es" ? "Tú" : "You"}
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
            className="flex flex-col gap-2 sm:flex-row sm:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("progress.followUpPlaceholder")}
              rows={3}
              className="min-h-[4.5rem] resize-y sm:flex-1"
              disabled={isTyping}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
            />
            <Button type="submit" disabled={!input.trim() || isTyping} className="shrink-0 sm:w-auto">
              <Send className="mr-2 h-4 w-4" aria-hidden="true" />
              {t("progress.sendFollowUp")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
