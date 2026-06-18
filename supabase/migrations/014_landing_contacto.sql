-- Redes sociales y textos de contacto del footer (landing EduKids)

CREATE TABLE IF NOT EXISTS public.landing_contacto (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  facebook_url TEXT NOT NULL DEFAULT 'https://www.facebook.com/edukidsguatemala/',
  instagram_url TEXT NOT NULL DEFAULT 'https://www.instagram.com/edukids_gt/',
  whatsapp_url TEXT NOT NULL DEFAULT 'https://wa.me/50259886915',
  footer_text TEXT NOT NULL DEFAULT 'Educación en robótica y STEAM para niños y jóvenes en Guatemala.',
  copyright_text TEXT NOT NULL DEFAULT '© 2026 EduKidsGt — Todos los derechos reservados.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.landing_contacto ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.landing_contacto TO anon, authenticated;
GRANT UPDATE ON public.landing_contacto TO authenticated;

DROP POLICY IF EXISTS "landing_contacto_public_read" ON public.landing_contacto;
CREATE POLICY "landing_contacto_public_read" ON public.landing_contacto
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "landing_contacto_admin" ON public.landing_contacto;
CREATE POLICY "landing_contacto_admin" ON public.landing_contacto
  FOR UPDATE TO authenticated
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

INSERT INTO public.landing_contacto (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;
