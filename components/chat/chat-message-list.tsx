"use client";

import { Bot, User, Volume2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChatMarkdown } from "@/components/chat/chat-markdown";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  role: "assistant" | "user";
  content: string;
}

interface ChatMessageListProps {
  messages: ChatMessage[];
  isTyping?: boolean;
  thinkingLabel?: string;
  assistantLabel?: string;
  userLabel?: string;
  onReadAloud?: (plainText: string) => void;
  isSpeaking?: boolean;
  readAloudLabel?: string;
}

export function ChatMessageList({
  messages,
  isTyping = false,
  thinkingLabel = "Pensando…",
  assistantLabel = "EduGuIA",
  userLabel = "Tú",
  onReadAloud,
  isSpeaking = false,
  readAloudLabel = "Leer en voz alta",
}: ChatMessageListProps) {
  return (
    <div className="w-full min-w-0 space-y-5 pb-2">
      {messages.map((message, index) => {
        const isUser = message.role === "user";
        return (
          <div
            key={`${message.role}-${index}`}
            className={cn(
              "flex w-full min-w-0 gap-2.5 sm:gap-3",
              isUser ? "flex-row-reverse" : "flex-row"
            )}
          >
            <Avatar className="mt-0.5 h-8 w-8 shrink-0 shadow-sm ring-2 ring-background sm:mt-1 sm:h-10 sm:w-10">
              <AvatarFallback
                className={cn(
                  "text-xs font-semibold",
                  isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-gradient-to-br from-primary to-secondary text-primary-foreground"
                )}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>

            <div
              className={cn(
                "flex min-w-0 max-w-[calc(100%-2.75rem)] flex-col gap-1 sm:max-w-[min(100%,36rem)]",
                isUser ? "items-end" : "items-start"
              )}
            >
              <span
                className={cn(
                  "px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground",
                  isUser && "text-right"
                )}
              >
                {isUser ? userLabel : assistantLabel}
              </span>

              <div
                className={cn(
                  "w-full rounded-2xl px-3 py-3 shadow-sm sm:px-4 sm:py-3.5",
                  isUser
                    ? "rounded-tr-md bg-primary text-primary-foreground shadow-primary/15"
                    : "rounded-tl-md border border-border/60 bg-card text-card-foreground"
                )}
                role={!isUser ? "status" : undefined}
                aria-live={!isUser ? "polite" : undefined}
              >
                {isUser ? (
                  <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
                    {message.content}
                  </p>
                ) : (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <ChatMarkdown content={message.content} className="flex-1" />
                    {onReadAloud && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 self-end text-muted-foreground hover:text-foreground sm:self-start"
                        onClick={() => {
                          const plain = message.content
                            .replace(/\*\*?/g, "")
                            .replace(/#+\s?/g, "")
                            .replace(/\n/g, " ")
                            .trim();
                          if (plain) onReadAloud(plain);
                        }}
                        aria-label={readAloudLabel}
                        title={readAloudLabel}
                      >
                        <Volume2 className={cn("h-4 w-4", isSpeaking && "text-primary")} />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {isTyping && (
        <div className="flex w-full min-w-0 gap-2.5 sm:gap-3">
          <Avatar className="h-9 w-9 shrink-0 sm:h-10 sm:w-10">
            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {assistantLabel}
            </span>
            <div className="rounded-2xl rounded-tl-md border border-border/60 bg-card px-4 py-3.5 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary/70 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary/70 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary/70" />
                </span>
                <span>{thinkingLabel}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
