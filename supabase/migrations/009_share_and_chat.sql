-- Enlaces públicos de informes familiares + mensajes en sesiones_chat

-- =============================================================================
-- 1. INFORMES COMPARTIDOS (enlace para familias)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.informes_compartidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT NOT NULL UNIQUE DEFAULT (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')),
  estudiante_id UUID NOT NULL REFERENCES public.estudiantes(id) ON DELETE CASCADE,
  docente_id UUID NOT NULL REFERENCES public.docentes(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  report_snapshot JSONB NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_informes_compartidos_token ON public.informes_compartidos(token);
CREATE INDEX IF NOT EXISTS idx_informes_compartidos_estudiante ON public.informes_compartidos(estudiante_id);

ALTER TABLE public.informes_compartidos ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.informes_compartidos TO authenticated;

DROP POLICY IF EXISTS "informes_compartidos_docente" ON public.informes_compartidos;
CREATE POLICY "informes_compartidos_docente" ON public.informes_compartidos
  FOR ALL TO authenticated
  USING (
    docente_id IN (SELECT id FROM public.docentes WHERE user_id = auth.uid())
  )
  WITH CHECK (
    docente_id IN (SELECT id FROM public.docentes WHERE user_id = auth.uid())
  );

-- =============================================================================
-- 2. SESIONES_CHAT — tipo de conversación + mensajes JSONB
-- =============================================================================
ALTER TABLE public.sesiones_chat
  ADD COLUMN IF NOT EXISTS tipo TEXT NOT NULL DEFAULT 'followup';

ALTER TABLE public.sesiones_chat
  ADD COLUMN IF NOT EXISTS mensajes JSONB NOT NULL DEFAULT '[]'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sesiones_chat_tipo_check'
  ) THEN
    ALTER TABLE public.sesiones_chat
      ADD CONSTRAINT sesiones_chat_tipo_check CHECK (tipo IN ('assessment', 'followup'));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_sesiones_chat_estudiante_tipo
  ON public.sesiones_chat(estudiante_id, tipo);
