-- Proyectos del portafolio editable en la landing EduKids

CREATE TABLE IF NOT EXISTS public.landing_portafolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  etiqueta TEXT NOT NULL DEFAULT '',
  titulo TEXT NOT NULL DEFAULT '',
  descripcion TEXT NOT NULL DEFAULT '',
  imagenes JSONB NOT NULL DEFAULT '[]'::jsonb,
  orden INT NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_landing_portafolio_orden ON public.landing_portafolio(orden, created_at);

ALTER TABLE public.landing_portafolio ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.landing_portafolio TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.landing_portafolio TO authenticated;

DROP POLICY IF EXISTS "landing_portafolio_public_read" ON public.landing_portafolio;
CREATE POLICY "landing_portafolio_public_read" ON public.landing_portafolio
  FOR SELECT TO anon, authenticated
  USING (activo = true);

DROP POLICY IF EXISTS "landing_portafolio_admin" ON public.landing_portafolio;
CREATE POLICY "landing_portafolio_admin" ON public.landing_portafolio
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

INSERT INTO public.landing_portafolio (etiqueta, titulo, descripcion, imagenes, orden) VALUES
  (
    'Robótica educativa',
    'Construcción y programación',
    'Los estudiantes diseñan y programan robots con componentes electrónicos, aplicando el método científico y trabajando en equipo para resolver retos reales.',
    '[
      {"url":"/wp-content/uploads/2019/08/portfolio-1a.jpg","alt":"Proyecto robótica 1"},
      {"url":"/wp-content/uploads/2019/08/portfolio-1b.jpg","alt":"Proyecto robótica 2"},
      {"url":"/wp-content/uploads/2019/08/portfolio-1c.jpg","alt":"Proyecto robótica 3"}
    ]'::jsonb,
    1
  ),
  (
    'Programación creativa',
    'Videojuegos con Scratch',
    'Desarrollo de juegos propios mientras aprenden lógica, bucles, variables y diseño — fortaleciendo creatividad y confianza en la tecnología.',
    '[
      {"url":"/wp-content/uploads/2019/08/portfolio-2a.jpg","alt":"Proyecto videojuegos 1"},
      {"url":"/wp-content/uploads/2019/08/portfolio-2b.jpg","alt":"Proyecto videojuegos 2"},
      {"url":"/wp-content/uploads/2019/08/portfolio-2c.jpg","alt":"Proyecto videojuegos 3"},
      {"url":"/wp-content/uploads/2019/08/portfolio-2d.jpg","alt":"Proyecto videojuegos 4"}
    ]'::jsonb,
    2
  );
