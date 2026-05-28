"use client";

import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

const markdownBase = cn(
  "chat-markdown text-[15px] leading-[1.65] text-foreground",
  "[&_p]:my-2.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
  "[&_strong]:font-semibold [&_strong]:text-foreground",
  "[&_em]:italic",
  "[&_h1]:mb-3 [&_h1]:mt-4 [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-foreground [&_h1:first-child]:mt-0",
  "[&_h2]:mb-2.5 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-foreground [&_h2:first-child]:mt-0",
  "[&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-[15px] [&_h3]:font-semibold [&_h3]:text-foreground",
  "[&_ul]:my-2.5 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5",
  "[&_ol]:my-2.5 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5",
  "[&_li]:pl-0.5 [&_li]:leading-relaxed",
  "[&_li>p]:my-1",
  "[&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:bg-primary/5 [&_blockquote]:py-2 [&_blockquote]:pl-4 [&_blockquote]:pr-2 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
  "[&_hr]:my-4 [&_hr]:border-border",
  "[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-primary/80",
  "[&_code]:rounded-md [&_code]:bg-background/80 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] [&_code]:text-foreground",
  "[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-border/60 [&_pre]:bg-background/90 [&_pre]:p-3",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[13px]"
);

interface ChatMarkdownProps {
  content: string;
  className?: string;
}

export function ChatMarkdown({ content, className }: ChatMarkdownProps) {
  return (
    <div className={cn(markdownBase, "min-w-0 break-words", className)}>
      <ReactMarkdown
        components={{
          pre: ({ children }) => (
            <pre className="scrollbar-thin max-w-full">{children}</pre>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
