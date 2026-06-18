-- Galería editable de la landing EduKids

CREATE TABLE IF NOT EXISTS public.landing_galeria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imagen_url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  orden INT NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_landing_galeria_orden ON public.landing_galeria(orden, created_at);

ALTER TABLE public.landing_galeria ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.landing_galeria TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.landing_galeria TO authenticated;

DROP POLICY IF EXISTS "landing_galeria_public_read" ON public.landing_galeria;
CREATE POLICY "landing_galeria_public_read" ON public.landing_galeria
  FOR SELECT TO anon, authenticated
  USING (activo = true);

DROP POLICY IF EXISTS "landing_galeria_admin" ON public.landing_galeria;
CREATE POLICY "landing_galeria_admin" ON public.landing_galeria
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'landing-media',
  'landing-media',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "landing_media_public_read" ON storage.objects;
CREATE POLICY "landing_media_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'landing-media');

DROP POLICY IF EXISTS "landing_media_admin_upload" ON storage.objects;
CREATE POLICY "landing_media_admin_upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'landing-media'
  AND public.current_user_role() = 'admin'
);

DROP POLICY IF EXISTS "landing_media_admin_delete" ON storage.objects;
CREATE POLICY "landing_media_admin_delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'landing-media'
  AND public.current_user_role() = 'admin'
);

INSERT INTO public.landing_galeria (imagen_url, alt_text, orden) VALUES
  ('/wp-content/uploads/2021/09/imagen-2_optimized.png', 'Actividad EduKids', 1),
  ('/wp-content/uploads/2021/09/imagen-3_optimized.png', 'Taller de robótica', 2),
  ('/wp-content/uploads/2021/09/imagen-1_optimized-3.png', 'Proyecto STEAM', 3),
  ('/wp-content/uploads/2020/03/WhatsApp-Image-2019-12-02-at-12.44.20-AM-4.jpeg', 'Clase EduKids', 4),
  ('/wp-content/uploads/2020/03/WhatsApp-Image-2019-12-02-at-12.44.14-AM-1.jpeg', 'Estudiantes en taller', 5),
  ('/wp-content/uploads/2020/08/CodingCritters-LearningResources-scaled.jpg', 'Robótica educativa', 6),
  ('/wp-content/uploads/2019/08/portfolio-1a.jpg', 'Portafolio proyecto 1', 7),
  ('/wp-content/uploads/2019/08/portfolio-2a.jpg', 'Portafolio proyecto 2', 8),
  ('/wp-content/uploads/2021/09/LOGO-EDU-KIDS.png', 'EduKids en acción', 9);
