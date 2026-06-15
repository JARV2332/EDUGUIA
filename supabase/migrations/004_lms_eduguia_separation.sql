-- Separa cuentas EDUGUIA (inclusión docente) del campus EduKids (LMS)

CREATE TABLE IF NOT EXISTS public.instructores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);
CREATE INDEX IF NOT EXISTS idx_instructores_user_id ON public.instructores(user_id);

ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES public.instructores(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_cursos_instructor_id ON public.cursos(instructor_id);

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'docente', 'estudiante', 'lms_docente'));

ALTER TABLE public.instructores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "instructores_own" ON public.instructores
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "instructores_admin" ON public.instructores
  FOR ALL USING (public.current_user_role() = 'admin');

-- Registro según app en metadata: eduguia vs edukids_lms
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_app TEXT := COALESCE(NEW.raw_user_meta_data->>'app', 'eduguia');
  user_role TEXT;
  user_nombre TEXT := COALESCE(
    NEW.raw_user_meta_data->>'nombre',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );
BEGIN
  IF user_app = 'edukids_lms' THEN
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'estudiante');
    IF user_role NOT IN ('admin', 'lms_docente', 'estudiante') THEN
      user_role := 'estudiante';
    END IF;

    INSERT INTO public.profiles (id, role, nombre)
    VALUES (NEW.id, user_role, user_nombre)
    ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, nombre = EXCLUDED.nombre;

    IF user_role = 'lms_docente' THEN
      INSERT INTO public.instructores (user_id, nombre)
      VALUES (NEW.id, user_nombre)
      ON CONFLICT (user_id) DO NOTHING;
    ELSIF user_role = 'estudiante' THEN
      INSERT INTO public.alumnos (user_id, nombre)
      VALUES (NEW.id, user_nombre)
      ON CONFLICT (user_id) DO NOTHING;
    END IF;
  ELSE
    INSERT INTO public.profiles (id, role, nombre)
    VALUES (NEW.id, 'docente', user_nombre)
    ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

    INSERT INTO public.docentes (user_id, nombre)
    VALUES (NEW.id, user_nombre)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP POLICY IF EXISTS "course_materials_upload" ON storage.objects;
CREATE POLICY "course_materials_upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'course-materials'
  AND public.current_user_role() IN ('admin', 'docente', 'lms_docente')
);
