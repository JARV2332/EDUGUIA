-- Preguntas frecuentes editables en la landing EduKids

CREATE TABLE IF NOT EXISTS public.landing_faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pregunta TEXT NOT NULL DEFAULT '',
  respuesta TEXT NOT NULL DEFAULT '',
  orden INT NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_landing_faq_orden ON public.landing_faq(orden, created_at);

ALTER TABLE public.landing_faq ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.landing_faq TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.landing_faq TO authenticated;

DROP POLICY IF EXISTS "landing_faq_public_read" ON public.landing_faq;
CREATE POLICY "landing_faq_public_read" ON public.landing_faq
  FOR SELECT TO anon, authenticated
  USING (activo = true);

DROP POLICY IF EXISTS "landing_faq_admin" ON public.landing_faq;
CREATE POLICY "landing_faq_admin" ON public.landing_faq
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

INSERT INTO public.landing_faq (pregunta, respuesta, orden) VALUES
  (
    '¿Desde qué edad pueden participar?',
    'Tenemos programas desde los 3 años en preescolar hasta adolescentes, según el curso. Revisa la ficha de cada taller en Servicios.',
    1
  ),
  (
    '¿Las clases son presenciales o virtuales?',
    'Ofrecemos modalidades según el programa. Algunos cursos incluyen clases virtuales y opción de préstamo de materiales.',
    2
  ),
  (
    '¿Qué metodología utilizan?',
    'Basamos el aprendizaje en el método científico y la cultura maker: los niños construyen, prueban y aprenden con autonomía.',
    3
  ),
  (
    '¿Cómo me inscribo?',
    'Escríbenos por Contacto, WhatsApp o redes sociales y te guiamos en el proceso.',
    4
  );
