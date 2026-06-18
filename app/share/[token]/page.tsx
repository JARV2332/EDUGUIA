"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FamilyReportView } from "@/components/progress/family-report-view";
import type { ReportSnapshot } from "@/lib/student-store";

export default function ShareReportPage() {
  const params = useParams();
  const token = params.token as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<{
    studentName: string;
    reportSnapshot: ReportSnapshot;
  } | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/share/${token}`);
        const data = (await res.json()) as {
          studentName?: string;
          reportSnapshot?: ReportSnapshot;
          error?: string;
        };

        if (!res.ok || !data.reportSnapshot) {
          throw new Error(data.error ?? "No se pudo cargar el informe.");
        }

        if (!cancelled) {
          setPayload({
            studentName: data.studentName ?? "Estudiante",
            reportSnapshot: data.reportSnapshot,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error al cargar.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
        Cargando informe…
      </main>
    );
  }

  if (error || !payload) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-destructive">Enlace no disponible</h1>
        <p className="mt-3 text-muted-foreground">{error ?? "Informe no encontrado."}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <FamilyReportView
        studentName={payload.studentName}
        snapshot={payload.reportSnapshot}
        locale="es"
      />
    </main>
  );
}
