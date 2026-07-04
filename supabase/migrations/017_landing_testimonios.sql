-- Testimonios para la página de inicio

CREATE TABLE IF NOT EXISTS public.landing_testimonios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL DEFAULT '',
  texto TEXT NOT NULL,
  orden INT NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_landing_testimonios_orden ON public.landing_testimonios(orden ASC);

ALTER TABLE public.landing_testimonios ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.landing_testimonios TO anon, authenticated;
GRANT ALL ON public.landing_testimonios TO authenticated;

DROP POLICY IF EXISTS "landing_testimonios_public_read" ON public.landing_testimonios;
CREATE POLICY "landing_testimonios_public_read" ON public.landing_testimonios
  FOR SELECT TO anon, authenticated
  USING (activo = true);

DROP POLICY IF EXISTS "landing_testimonios_admin" ON public.landing_testimonios;
CREATE POLICY "landing_testimonios_admin" ON public.landing_testimonios
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

INSERT INTO public.landing_testimonios (nombre, rol, texto, orden, activo) VALUES
  (
    'María L.',
    'Madre de alumno',
    'Mi hijo llegó con curiosidad y hoy construye sus propios proyectos de robótica. EduKids despertó en él confianza para resolver problemas.',
    1,
    true
  ),
  (
    'Carlos R.',
    'Padre de familia',
    'Los talleres combinan diversión y aprendizaje real. Se nota el método: los niños piensan, prueban y mejoran sus ideas en equipo.',
    2,
    true
  ),
  (
    'Prof. Ana M.',
    'Docente aliada',
    'EduKids acompaña con materiales claros y un enfoque maker que facilita integrar STEAM en el aula con entusiasmo.',
    3,
    true
  );