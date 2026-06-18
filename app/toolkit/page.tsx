"use client";

import { AppShell } from "@/components/app-shell";
import { ToolkitMainContent } from "@/components/toolkit/toolkit-main-content";

export default function ToolkitPage() {
  return (
    <AppShell>
      <div className="p-6 lg:p-8">
        <ToolkitMainContent />
      </div>
    </AppShell>
  );
}
