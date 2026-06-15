-- Lectura pública del catálogo de cursos publicados (página /servicios)

GRANT SELECT ON public.cursos TO anon, authenticated;

DROP POLICY IF EXISTS "cursos_public_catalog" ON public.cursos;
CREATE POLICY "cursos_public_catalog" ON public.cursos
  FOR SELECT TO anon, authenticated
  USING (publicado = true);
