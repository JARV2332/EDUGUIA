-- EDUGUIA - Esquema completo (proyecto nuevo desde cero)
-- SQL Editor: https://supabase.com/dashboard/project/tvqbhxprglnrkvrfawqi/sql/new

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.docentes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT,
  escuela TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);
CREATE INDEX IF NOT EXISTS idx_docentes_user_id ON public.docentes(user_id);

CREATE TABLE IF NOT EXISTS public.estudiantes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  docente_id UUID NOT NULL REFERENCES public.docentes(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  edad TEXT,
  assessment_data JSONB DEFAULT '{}',
  completed_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_estudiantes_docente_id ON public.estudiantes(docente_id);

CREATE TABLE IF NOT EXISTS public.sesiones_chat (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estudiante_id UUID NOT NULL REFERENCES public.estudiantes(id) ON DELETE CASCADE,
  docente_id UUID NOT NULL REFERENCES public.docentes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sesiones_chat_estudiante ON public.sesiones_chat(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_chat_docente ON public.sesiones_chat(docente_id);

CREATE TABLE IF NOT EXISTS public.planes_intervencion (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estudiante_id UUID NOT NULL REFERENCES public.estudiantes(id) ON DELETE CASCADE,
  docente_id UUID NOT NULL REFERENCES public.docentes(id) ON DELETE CASCADE,
  observacion_docente TEXT NOT NULL,
  respuesta_ia TEXT NOT NULL,
  analisis_ia TEXT,
  estrategias_dua JSONB DEFAULT '[]',
  consejos_kaqchikel JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_planes_estudiante_id ON public.planes_intervencion(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_planes_docente_id ON public.planes_intervencion(docente_id);
CREATE INDEX IF NOT EXISTS idx_planes_created_at ON public.planes_intervencion(estudiante_id, created_at DESC);

ALTER TABLE public.docentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planes_intervencion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "docentes_own" ON public.docentes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "estudiantes_docente" ON public.estudiantes FOR ALL USING (
  docente_id IN (SELECT id FROM public.docentes WHERE user_id = auth.uid())
);
CREATE POLICY "sesiones_docente" ON public.sesiones_chat FOR ALL USING (
  docente_id IN (SELECT id FROM public.docentes WHERE user_id = auth.uid())
);
CREATE POLICY "planes_docente" ON public.planes_intervencion FOR ALL USING (
  docente_id IN (SELECT id FROM public.docentes WHERE user_id = auth.uid())
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.docentes (user_id, nombre)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS docentes_updated ON public.docentes;
CREATE TRIGGER docentes_updated BEFORE UPDATE ON public.docentes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS estudiantes_updated ON public.estudiantes;
CREATE TRIGGER estudiantes_updated BEFORE UPDATE ON public.estudiantes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS sesiones_updated ON public.sesiones_chat;
CREATE TRIGGER sesiones_updated BEFORE UPDATE ON public.sesiones_chat FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
