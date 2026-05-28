import type { jsPDF } from "jspdf";
import type { AssessmentData, TimelineEntry } from "@/lib/student-store";

export interface ConversationBlock {
  at?: string;
  role: "teacher" | "assistant";
  text: string;
  phase: "assessment" | "followup";
}

export function stripMarkdownForPdf(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^#+\s?/gm, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function buildConversationBlocks(data: AssessmentData): ConversationBlock[] {
  const blocks: ConversationBlock[] = [];

  for (const pair of data.aiResponses ?? []) {
    if (pair.question?.trim()) {
      blocks.push({
        role: "assistant",
        text: pair.question.trim(),
        phase: "assessment",
      });
    }
    if (pair.answer?.trim()) {
      blocks.push({
        role: "teacher",
        text: pair.answer.trim(),
        phase: "assessment",
      });
    }
  }

  for (const entry of data.followUpLog ?? []) {
    if (entry.user?.trim()) {
      blocks.push({
        at: entry.at,
        role: "teacher",
        text: entry.user.trim(),
        phase: "followup",
      });
    }
    if (entry.assistant?.trim()) {
      blocks.push({
        at: entry.at,
        role: "assistant",
        text: entry.assistant.trim(),
        phase: "followup",
      });
    }
  }

  return blocks;
}

export interface PdfLayoutContext {
  doc: jsPDF;
  marginLeft: number;
  maxWidth: number;
  lineHeight: number;
  maxY: number;
  marginTop: number;
  getY: () => number;
  setY: (y: number) => void;
  maybeNewPage: (needed: number) => void;
}

export interface ConversationPdfLabels {
  sectionTitle: string;
  assessmentPhase: string;
  followUpPhase: string;
  teacher: string;
  ai: string;
  timeline: string;
  typeAssessment: string;
  typeObservation: string;
  typeMilestone: string;
  typeIntervention: string;
  noConversation: string;
  noTimeline: string;
}

export function renderConversationSection(
  ctx: PdfLayoutContext,
  blocks: ConversationBlock[],
  labels: ConversationPdfLabels
): void {
  const { doc, marginLeft, maxWidth, lineHeight, maybeNewPage } = ctx;
  let cursorY = ctx.getY();

  const addSectionTitle = (text: string) => {
    maybeNewPage(10);
    cursorY = ctx.getY();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 76, 129);
    doc.text(text, marginLeft, cursorY);
    doc.setTextColor(0, 0, 0);
    cursorY += lineHeight + 3;
    ctx.setY(cursorY);
  };

  const addSubheading = (text: string) => {
    maybeNewPage(8);
    cursorY = ctx.getY();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(text, marginLeft, cursorY);
    doc.setTextColor(0, 0, 0);
    cursorY += lineHeight + 1;
    ctx.setY(cursorY);
  };

  const addMessage = (roleLabel: string, body: string, isAssistant: boolean) => {
    const plain = stripMarkdownForPdf(body);
    if (!plain) return;

    maybeNewPage(lineHeight * 4);
    cursorY = ctx.getY();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(isAssistant ? 0 : 40, isAssistant ? 102 : 40, isAssistant ? 153 : 40);
    doc.text(roleLabel, marginLeft + 2, cursorY);
    doc.setTextColor(0, 0, 0);
    cursorY += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const indent = marginLeft + 4;
    const wrapW = maxWidth - 8;
    const lines = doc.splitTextToSize(plain, wrapW);
    const boxH = lines.length * lineHeight + 4;

    maybeNewPage(boxH + 2);
    cursorY = ctx.getY();

    doc.setDrawColor(220, 228, 235);
    doc.setFillColor(isAssistant ? 248 : 252, isAssistant ? 250 : 253, isAssistant ? 252 : 255);
    doc.roundedRect(marginLeft, cursorY - 2, maxWidth, boxH, 2, 2, "FD");

    lines.forEach((line: string) => {
      doc.text(line, indent, cursorY + 2);
      cursorY += lineHeight;
    });
    cursorY += 4;
    ctx.setY(cursorY);
  };

  addSectionTitle(labels.sectionTitle);

  if (blocks.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text(labels.noConversation, marginLeft, ctx.getY());
    ctx.setY(ctx.getY() + lineHeight + 2);
    return;
  }

  let currentPhase: ConversationBlock["phase"] | null = null;
  for (const block of blocks) {
    if (block.phase !== currentPhase) {
      currentPhase = block.phase;
      addSubheading(
        currentPhase === "assessment" ? labels.assessmentPhase : labels.followUpPhase
      );
    }
    if (block.at) {
      maybeNewPage(lineHeight);
      cursorY = ctx.getY();
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(block.at, marginLeft + 2, cursorY);
      doc.setTextColor(0, 0, 0);
      cursorY += lineHeight;
      ctx.setY(cursorY);
    }
    addMessage(
      block.role === "teacher" ? labels.teacher : labels.ai,
      block.text,
      block.role === "assistant"
    );
  }
}

export function renderTimelineSection(
  ctx: PdfLayoutContext,
  entries: TimelineEntry[],
  labels: ConversationPdfLabels
): void {
  const { doc, marginLeft, maxWidth, lineHeight, maybeNewPage } = ctx;
  let cursorY = ctx.getY();

  const typeLabel = (type: TimelineEntry["type"]) => {
    switch (type) {
      case "assessment":
        return labels.typeAssessment;
      case "observation":
        return labels.typeObservation;
      case "milestone":
        return labels.typeMilestone;
      case "intervention":
        return labels.typeIntervention;
      default:
        return type;
    }
  };

  maybeNewPage(10);
  cursorY = ctx.getY();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 76, 129);
  doc.text(labels.timeline, marginLeft, cursorY);
  doc.setTextColor(0, 0, 0);
  cursorY += lineHeight + 3;
  ctx.setY(cursorY);

  if (entries.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text(labels.noTimeline, marginLeft, ctx.getY());
    ctx.setY(ctx.getY() + lineHeight + 2);
    return;
  }

  for (const entry of entries) {
    maybeNewPage(lineHeight * 6);
    cursorY = ctx.getY();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`[${entry.date}] ${typeLabel(entry.type)}: ${entry.title}`, marginLeft, cursorY);
    cursorY += lineHeight;
    ctx.setY(cursorY);

    if (entry.type === "intervention" && entry.aiResponse) {
      const teacherText = entry.description?.trim();
      if (teacherText) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(labels.teacher, marginLeft + 2, ctx.getY());
        ctx.setY(ctx.getY() + lineHeight);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const tLines = doc.splitTextToSize(stripMarkdownForPdf(teacherText), maxWidth - 6);
        tLines.forEach((l: string) => {
          maybeNewPage(lineHeight);
          doc.text(l, marginLeft + 4, ctx.getY());
          ctx.setY(ctx.getY() + lineHeight);
        });
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      maybeNewPage(lineHeight);
      doc.text(labels.ai, marginLeft + 2, ctx.getY());
      ctx.setY(ctx.getY() + lineHeight);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const aLines = doc.splitTextToSize(
        stripMarkdownForPdf(entry.aiResponse),
        maxWidth - 6
      );
      aLines.forEach((l: string) => {
        maybeNewPage(lineHeight);
        doc.text(l, marginLeft + 4, ctx.getY());
        ctx.setY(ctx.getY() + lineHeight);
      });
    } else if (entry.description?.trim()) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const lines = doc.splitTextToSize(entry.description.trim(), maxWidth - 4);
      lines.forEach((l: string) => {
        maybeNewPage(lineHeight);
        doc.text(l, marginLeft + 2, ctx.getY());
        ctx.setY(ctx.getY() + lineHeight);
      });
    }
    ctx.setY(ctx.getY() + 3);
  }
}
