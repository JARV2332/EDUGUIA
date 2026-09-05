-- EDUGUIA / EduKids — esquema completo (idempotente)
-- Se puede correr otra vez: hace DROP POLICY IF EXISTS antes de crear.
-- SQL Editor: https://supabase.com/dashboard/project/tijbsmhzszioatizjnpd/sql/new


-- ========== schema.sql ==========
-- EDUGUIA - Esquema completo (proyecto nuevo desde cero)
-- SQL Editor: https://supabase.com/dashboard/project/tijbsmhzszioatizjnpd/sql/new

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

DROP POLICY IF EXISTS "docentes_own" ON public.docentes;
DROP POLICY IF EXISTS "estudiantes_docente" ON public.estudiantes;
DROP POLICY IF EXISTS "sesiones_docente" ON public.sesiones_chat;
DROP POLICY IF EXISTS "planes_docente" ON public.planes_intervencion;

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


-- ========== migrations\002_teacher_profile.sql ==========
-- Perfil docente: escuela + avatares en Storage
ALTER TABLE public.docentes ADD COLUMN IF NOT EXISTS escuela TEXT;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'teacher-avatars',
  'teacher-avatars',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "teacher_avatars_public_read" ON storage.objects;
CREATE POLICY "teacher_avatars_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'teacher-avatars');

DROP POLICY IF EXISTS "teacher_avatars_upload_own" ON storage.objects;
CREATE POLICY "teacher_avatars_upload_own"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'teacher-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "teacher_avatars_update_own" ON storage.objects;
CREATE POLICY "teacher_avatars_update_own"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'teacher-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "teacher_avatars_delete_own" ON storage.objects;
CREATE POLICY "teacher_avatars_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'teacher-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);


-- ========== migrations\003_lms_mvp.sql ==========
-- LMS MVP: roles, cursos, materiales, tareas y matrÃ­culas

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'docente', 'estudiante')),
  nombre TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.alumnos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);
CREATE INDEX IF NOT EXISTS idx_alumnos_user_id ON public.alumnos(user_id);

CREATE TABLE IF NOT EXISTS public.cursos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  edad_min INT,
  edad_max INT,
  imagen_url TEXT,
  docente_id UUID REFERENCES public.docentes(id) ON DELETE SET NULL,
  publicado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cursos_docente_id ON public.cursos(docente_id);
CREATE INDEX IF NOT EXISTS idx_cursos_publicado ON public.cursos(publicado);

CREATE TABLE IF NOT EXISTS public.modulos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  orden INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_modulos_curso_id ON public.modulos(curso_id);

CREATE TABLE IF NOT EXISTS public.materiales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  modulo_id UUID NOT NULL REFERENCES public.modulos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('video', 'pdf', 'link', 'texto', 'actividad')),
  contenido TEXT,
  url TEXT,
  storage_path TEXT,
  orden INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_materiales_modulo_id ON public.materiales(modulo_id);

CREATE TABLE IF NOT EXISTS public.matriculas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  alumno_id UUID NOT NULL REFERENCES public.alumnos(id) ON DELETE CASCADE,
  estado TEXT NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'completada', 'suspendida')),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(curso_id, alumno_id)
);
CREATE INDEX IF NOT EXISTS idx_matriculas_alumno_id ON public.matriculas(alumno_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_curso_id ON public.matriculas(curso_id);

CREATE TABLE IF NOT EXISTS public.tareas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  modulo_id UUID NOT NULL REFERENCES public.modulos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  instrucciones TEXT,
  fecha_entrega DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tareas_modulo_id ON public.tareas(modulo_id);

CREATE TABLE IF NOT EXISTS public.entregas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tarea_id UUID NOT NULL REFERENCES public.tareas(id) ON DELETE CASCADE,
  alumno_id UUID NOT NULL REFERENCES public.alumnos(id) ON DELETE CASCADE,
  contenido TEXT,
  archivo_url TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'enviada', 'revisada')),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tarea_id, alumno_id)
);
CREATE INDEX IF NOT EXISTS idx_entregas_alumno_id ON public.entregas(alumno_id);

-- Perfiles existentes (docentes actuales)
INSERT INTO public.profiles (id, role, nombre)
SELECT d.user_id, 'docente', d.nombre
FROM public.docentes d
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matriculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entregas ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

DROP POLICY IF EXISTS "profiles_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_read" ON public.profiles;
DROP POLICY IF EXISTS "alumnos_own" ON public.alumnos;
DROP POLICY IF EXISTS "alumnos_admin" ON public.alumnos;
DROP POLICY IF EXISTS "cursos_read_published" ON public.cursos;
DROP POLICY IF EXISTS "cursos_admin" ON public.cursos;
DROP POLICY IF EXISTS "cursos_docente_manage" ON public.cursos;
DROP POLICY IF EXISTS "modulos_read" ON public.modulos;
DROP POLICY IF EXISTS "modulos_admin" ON public.modulos;
DROP POLICY IF EXISTS "modulos_docente" ON public.modulos;
DROP POLICY IF EXISTS "materiales_read" ON public.materiales;
DROP POLICY IF EXISTS "materiales_admin" ON public.materiales;
DROP POLICY IF EXISTS "materiales_docente" ON public.materiales;
DROP POLICY IF EXISTS "matriculas_admin" ON public.matriculas;
DROP POLICY IF EXISTS "matriculas_docente" ON public.matriculas;
DROP POLICY IF EXISTS "matriculas_alumno_read" ON public.matriculas;
DROP POLICY IF EXISTS "tareas_read" ON public.tareas;
DROP POLICY IF EXISTS "tareas_admin" ON public.tareas;
DROP POLICY IF EXISTS "tareas_docente" ON public.tareas;
DROP POLICY IF EXISTS "entregas_admin" ON public.entregas;
DROP POLICY IF EXISTS "entregas_docente_read" ON public.entregas;
DROP POLICY IF EXISTS "entregas_alumno" ON public.entregas;

CREATE POLICY "profiles_own" ON public.profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "profiles_admin_read" ON public.profiles
  FOR SELECT USING (public.current_user_role() = 'admin');

CREATE POLICY "alumnos_own" ON public.alumnos
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "alumnos_admin" ON public.alumnos
  FOR ALL USING (public.current_user_role() = 'admin');

CREATE POLICY "cursos_read_published" ON public.cursos
  FOR SELECT USING (
    publicado = true
    OR public.current_user_role() = 'admin'
    OR docente_id IN (SELECT id FROM public.docentes WHERE user_id = auth.uid())
  );

CREATE POLICY "cursos_admin" ON public.cursos
  FOR ALL USING (public.current_user_role() = 'admin');

CREATE POLICY "cursos_docente_manage" ON public.cursos
  FOR ALL USING (
    docente_id IN (SELECT id FROM public.docentes WHERE user_id = auth.uid())
  );

CREATE POLICY "modulos_read" ON public.modulos
  FOR SELECT USING (
    public.current_user_role() = 'admin'
    OR curso_id IN (
      SELECT c.id FROM public.cursos c
      WHERE c.publicado = true
        OR c.docente_id IN (SELECT id FROM public.docentes WHERE user_id = auth.uid())
    )
    OR curso_id IN (
      SELECT m.curso_id FROM public.matriculas m
      JOIN public.alumnos a ON a.id = m.alumno_id
      WHERE a.user_id = auth.uid() AND m.estado = 'activa'
    )
  );

CREATE POLICY "modulos_admin" ON public.modulos FOR ALL USING (public.current_user_role() = 'admin');
CREATE POLICY "modulos_docente" ON public.modulos FOR ALL USING (
  curso_id IN (SELECT id FROM public.cursos WHERE docente_id IN (SELECT id FROM public.docentes WHERE user_id = auth.uid()))
);

CREATE POLICY "materiales_read" ON public.materiales
  FOR SELECT USING (
    public.current_user_role() = 'admin'
    OR modulo_id IN (SELECT id FROM public.modulos)
  );

CREATE POLICY "materiales_admin" ON public.materiales FOR ALL USING (public.current_user_role() = 'admin');
CREATE POLICY "materiales_docente" ON public.materiales FOR ALL USING (
  modulo_id IN (
    SELECT mo.id FROM public.modulos mo
    JOIN public.cursos c ON c.id = mo.curso_id
    WHERE c.docente_id IN (SELECT id FROM public.docentes WHERE user_id = auth.uid())
  )
);

CREATE POLICY "matriculas_admin" ON public.matriculas FOR ALL USING (public.current_user_role() = 'admin');
CREATE POLICY "matriculas_docente" ON public.matriculas FOR ALL USING (
  curso_id IN (SELECT id FROM public.cursos WHERE docente_id IN (SELECT id FROM public.docentes WHERE user_id = auth.uid()))
);
CREATE POLICY "matriculas_alumno_read" ON public.matriculas
  FOR SELECT USING (
    alumno_id IN (SELECT id FROM public.alumnos WHERE user_id = auth.uid())
  );

CREATE POLICY "tareas_read" ON public.tareas FOR SELECT USING (
  public.current_user_role() IN ('admin', 'docente', 'estudiante')
);
CREATE POLICY "tareas_admin" ON public.tareas FOR ALL USING (public.current_user_role() = 'admin');
CREATE POLICY "tareas_docente" ON public.tareas FOR ALL USING (
  modulo_id IN (
    SELECT mo.id FROM public.modulos mo
    JOIN public.cursos c ON c.id = mo.curso_id
    WHERE c.docente_id IN (SELECT id FROM public.docentes WHERE user_id = auth.uid())
  )
);

CREATE POLICY "entregas_admin" ON public.entregas FOR ALL USING (public.current_user_role() = 'admin');
CREATE POLICY "entregas_docente_read" ON public.entregas FOR SELECT USING (
  tarea_id IN (
    SELECT t.id FROM public.tareas t
    JOIN public.modulos mo ON mo.id = t.modulo_id
    JOIN public.cursos c ON c.id = mo.curso_id
    WHERE c.docente_id IN (SELECT id FROM public.docentes WHERE user_id = auth.uid())
  )
);
CREATE POLICY "entregas_alumno" ON public.entregas FOR ALL USING (
  alumno_id IN (SELECT id FROM public.alumnos WHERE user_id = auth.uid())
);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-materials',
  'course-materials',
  true,
  52428800,
  ARRAY['video/mp4', 'video/webm', 'application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "course_materials_public_read" ON storage.objects;
CREATE POLICY "course_materials_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-materials');

DROP POLICY IF EXISTS "course_materials_upload" ON storage.objects;
CREATE POLICY "course_materials_upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'course-materials'
  AND public.current_user_role() IN ('admin', 'docente')
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT := COALESCE(NEW.raw_user_meta_data->>'role', 'docente');
  user_nombre TEXT := COALESCE(
    NEW.raw_user_meta_data->>'nombre',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );
BEGIN
  IF user_role NOT IN ('admin', 'docente', 'estudiante') THEN
    user_role := 'docente';
  END IF;

  INSERT INTO public.profiles (id, role, nombre)
  VALUES (NEW.id, user_role, user_nombre)
  ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

  IF user_role = 'docente' THEN
    INSERT INTO public.docentes (user_id, nombre)
    VALUES (NEW.id, user_nombre)
    ON CONFLICT (user_id) DO NOTHING;
  ELSIF user_role = 'estudiante' THEN
    INSERT INTO public.alumnos (user_id, nombre)
    VALUES (NEW.id, user_nombre)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS profiles_updated ON public.profiles;
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS alumnos_updated ON public.alumnos;
CREATE TRIGGER alumnos_updated BEFORE UPDATE ON public.alumnos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS cursos_updated ON public.cursos;
CREATE TRIGGER cursos_updated BEFORE UPDATE ON public.cursos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ========== migrations\004_lms_eduguia_separation.sql ==========
-- Separa cuentas EDUGUIA (inclusiÃ³n docente) del campus EduKids (LMS)

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

DROP POLICY IF EXISTS "instructores_own" ON public.instructores;
DROP POLICY IF EXISTS "instructores_admin" ON public.instructores;

CREATE POLICY "instructores_own" ON public.instructores
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "instructores_admin" ON public.instructores
  FOR ALL USING (public.current_user_role() = 'admin');

-- Registro segÃºn app en metadata: eduguia vs edukids_lms
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


-- ========== migrations\005_campus_usernames.sql ==========
-- Usuario de acceso al campus (sin correo real): admin crea cuentas con username + contraseÃ±a

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username) WHERE username IS NOT NULL;

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
  user_username TEXT := NULLIF(LOWER(TRIM(NEW.raw_user_meta_data->>'username')), '');
BEGIN
  IF user_app = 'edukids_lms' THEN
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'estudiante');
    IF user_role NOT IN ('admin', 'lms_docente', 'estudiante') THEN
      user_role := 'estudiante';
    END IF;

    INSERT INTO public.profiles (id, role, nombre, username)
    VALUES (NEW.id, user_role, user_nombre, user_username)
    ON CONFLICT (id) DO UPDATE SET
      role = EXCLUDED.role,
      nombre = EXCLUDED.nombre,
      username = COALESCE(EXCLUDED.username, public.profiles.username);

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


-- ========== migrations\006_cursos_catalogo_servicios.sql ==========
-- Campos de catÃ¡logo pÃºblico (pÃ¡gina /servicios) para cursos publicados

ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS precio NUMERIC(10, 2);
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS precio_moneda TEXT NOT NULL DEFAULT 'GTQ';
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS duracion TEXT;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS modalidad TEXT;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS edad_publico TEXT;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS orden_servicios INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_cursos_orden_servicios ON public.cursos(orden_servicios);


-- ========== migrations\007_cursos_public_read.sql ==========
-- Lectura pÃºblica del catÃ¡logo de cursos publicados (pÃ¡gina /servicios)

GRANT SELECT ON public.cursos TO anon, authenticated;

DROP POLICY IF EXISTS "cursos_public_catalog" ON public.cursos;
CREATE POLICY "cursos_public_catalog" ON public.cursos
  FOR SELECT TO anon, authenticated
  USING (publicado = true);


-- ========== migrations\008_contactos.sql ==========
-- Mensajes del formulario de contacto (/comunicate-con-nosotros)

CREATE TABLE IF NOT EXISTS public.contactos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  motivo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  leido BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contactos_created_at ON public.contactos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contactos_leido ON public.contactos(leido);

ALTER TABLE public.contactos ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON public.contactos TO anon, authenticated;
GRANT SELECT, UPDATE ON public.contactos TO authenticated;

DROP POLICY IF EXISTS "contactos_public_insert" ON public.contactos;
CREATE POLICY "contactos_public_insert" ON public.contactos
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "contactos_admin" ON public.contactos;
CREATE POLICY "contactos_admin" ON public.contactos
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');


-- ========== migrations\009_share_and_chat.sql ==========
-- Enlaces pÃºblicos de informes familiares + mensajes en sesiones_chat

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
-- 2. SESIONES_CHAT â€” tipo de conversaciÃ³n + mensajes JSONB
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


-- ========== migrations\010_landing_galeria.sql ==========
-- GalerÃ­a editable de la landing EduKids

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
  ('/wp-content/uploads/2021/09/imagen-3_optimized.png', 'Taller de robÃ³tica', 2),
  ('/wp-content/uploads/2021/09/imagen-1_optimized-3.png', 'Proyecto STEAM', 3),
  ('/wp-content/uploads/2020/03/WhatsApp-Image-2019-12-02-at-12.44.20-AM-4.jpeg', 'Clase EduKids', 4),
  ('/wp-content/uploads/2020/03/WhatsApp-Image-2019-12-02-at-12.44.14-AM-1.jpeg', 'Estudiantes en taller', 5),
  ('/wp-content/uploads/2020/08/CodingCritters-LearningResources-scaled.jpg', 'RobÃ³tica educativa', 6),
  ('/wp-content/uploads/2019/08/portfolio-1a.jpg', 'Portafolio proyecto 1', 7),
  ('/wp-content/uploads/2019/08/portfolio-2a.jpg', 'Portafolio proyecto 2', 8),
  ('/wp-content/uploads/2021/09/LOGO-EDU-KIDS.png', 'EduKids en acciÃ³n', 9);


-- ========== migrations\011_landing_home.sql ==========
-- Contenido editable de la pÃ¡gina de inicio (hero y secciones principales)

CREATE TABLE IF NOT EXISTS public.landing_home (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  hero_bg_url TEXT NOT NULL DEFAULT '/wp-content/uploads/2021/09/slider1-2-min.jpg',
  hero_tagline TEXT NOT NULL DEFAULT 'EducaciÃ³n para todos los niÃ±os',
  hero_logo_url TEXT NOT NULL DEFAULT '/assets/logo-edukids.png',
  hero_text TEXT NOT NULL DEFAULT 'Nuestro mÃ©todo educativo estÃ¡ basado en el mÃ©todo cientÃ­fico, de manera que se motiva al alumno a mejorar su autonomÃ­a y pensamiento crÃ­tico.',
  hero_btn_text TEXT NOT NULL DEFAULT 'Leer mÃ¡s',
  hero_btn_href TEXT NOT NULL DEFAULT '#nosotros',
  about_img_main TEXT NOT NULL DEFAULT '/wp-content/uploads/2021/09/imagen-2_optimized.png',
  about_img_secondary_1 TEXT NOT NULL DEFAULT '/wp-content/uploads/2021/09/imagen-3_optimized.png',
  about_img_secondary_2 TEXT NOT NULL DEFAULT '/wp-content/uploads/2021/09/imagen-1_optimized-3.png',
  about_paragraph_1 TEXT NOT NULL DEFAULT 'EDUKIDS es una empresa guatemalteca que cree firmemente en el potencial de cada guatemalteco. Preparamos a niÃ±as y niÃ±os mediante la robÃ³tica para un mundo tecnolÃ³gico y digital; ellos se involucran en su propio proceso de aprendizaje y potencian habilidades en Ã¡reas STEAM.',
  about_paragraph_2 TEXT NOT NULL DEFAULT 'EnseÃ±amos robÃ³tica educativa integrando electrÃ³nica y programaciÃ³n a niÃ±os y jÃ³venes de 4 a 17 aÃ±os, apostando por su desarrollo como personas y profesionales del siglo XXI.',
  enfoque_image_url TEXT NOT NULL DEFAULT '/wp-content/uploads/2019/08/portfolio-1a.jpg',
  enfoque_text TEXT NOT NULL DEFAULT 'Desarrollar la inteligencia y creatividad, fomentar el trabajo en equipo y resolver problemas con divisiÃ³n de tareas. Los niÃ±os identifican los mejores componentes para cada reto, desarrollan habilidades sociales y refuerzan su autoestima.',
  metodo_image_url TEXT NOT NULL DEFAULT '/wp-content/uploads/2021/09/LOGO-EDU-KIDS.png',
  metodo_text TEXT NOT NULL DEFAULT 'Nuestro mÃ©todo se basa en el mÃ©todo cientÃ­fico: se motiva al alumno a mejorar su autonomÃ­a y pensamiento crÃ­tico, dejando que marquen los objetivos reales de los proyectos. Ensayan el mÃ©todo de prueba y error para estimular autonomÃ­a y confianza.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.landing_home ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.landing_home TO anon, authenticated;
GRANT UPDATE ON public.landing_home TO authenticated;

DROP POLICY IF EXISTS "landing_home_public_read" ON public.landing_home;
CREATE POLICY "landing_home_public_read" ON public.landing_home
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "landing_home_admin" ON public.landing_home;
CREATE POLICY "landing_home_admin" ON public.landing_home
  FOR UPDATE TO authenticated
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

INSERT INTO public.landing_home (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;


-- ========== migrations\012_landing_portafolio.sql ==========
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
    'RobÃ³tica educativa',
    'ConstrucciÃ³n y programaciÃ³n',
    'Los estudiantes diseÃ±an y programan robots con componentes electrÃ³nicos, aplicando el mÃ©todo cientÃ­fico y trabajando en equipo para resolver retos reales.',
    '[
      {"url":"/wp-content/uploads/2019/08/portfolio-1a.jpg","alt":"Proyecto robÃ³tica 1"},
      {"url":"/wp-content/uploads/2019/08/portfolio-1b.jpg","alt":"Proyecto robÃ³tica 2"},
      {"url":"/wp-content/uploads/2019/08/portfolio-1c.jpg","alt":"Proyecto robÃ³tica 3"}
    ]'::jsonb,
    1
  ),
  (
    'ProgramaciÃ³n creativa',
    'Videojuegos con Scratch',
    'Desarrollo de juegos propios mientras aprenden lÃ³gica, bucles, variables y diseÃ±o â€” fortaleciendo creatividad y confianza en la tecnologÃ­a.',
    '[
      {"url":"/wp-content/uploads/2019/08/portfolio-2a.jpg","alt":"Proyecto videojuegos 1"},
      {"url":"/wp-content/uploads/2019/08/portfolio-2b.jpg","alt":"Proyecto videojuegos 2"},
      {"url":"/wp-content/uploads/2019/08/portfolio-2c.jpg","alt":"Proyecto videojuegos 3"},
      {"url":"/wp-content/uploads/2019/08/portfolio-2d.jpg","alt":"Proyecto videojuegos 4"}
    ]'::jsonb,
    2
  );


-- ========== migrations\013_landing_faq.sql ==========
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
    'Â¿Desde quÃ© edad pueden participar?',
    'Tenemos programas desde los 3 aÃ±os en preescolar hasta adolescentes, segÃºn el curso. Revisa la ficha de cada taller en Servicios.',
    1
  ),
  (
    'Â¿Las clases son presenciales o virtuales?',
    'Ofrecemos modalidades segÃºn el programa. Algunos cursos incluyen clases virtuales y opciÃ³n de prÃ©stamo de materiales.',
    2
  ),
  (
    'Â¿QuÃ© metodologÃ­a utilizan?',
    'Basamos el aprendizaje en el mÃ©todo cientÃ­fico y la cultura maker: los niÃ±os construyen, prueban y aprenden con autonomÃ­a.',
    3
  ),
  (
    'Â¿CÃ³mo me inscribo?',
    'EscrÃ­benos por Contacto, WhatsApp o redes sociales y te guiamos en el proceso.',
    4
  );


-- ========== migrations\014_landing_contacto.sql ==========
-- Redes sociales y textos de contacto del footer (landing EduKids)

CREATE TABLE IF NOT EXISTS public.landing_contacto (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  facebook_url TEXT NOT NULL DEFAULT 'https://www.facebook.com/edukidsguatemala/',
  instagram_url TEXT NOT NULL DEFAULT 'https://www.instagram.com/edukids_gt/',
  whatsapp_url TEXT NOT NULL DEFAULT 'https://wa.me/50259886915',
  footer_text TEXT NOT NULL DEFAULT 'EducaciÃ³n en robÃ³tica y STEAM para niÃ±os y jÃ³venes en Guatemala.',
  copyright_text TEXT NOT NULL DEFAULT 'Â© 2026 EduKidsGt â€” Todos los derechos reservados.',
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


-- ========== migrations\015_landing_home_hero_headline.sql ==========
-- Titular principal editable del hero

ALTER TABLE public.landing_home
  ADD COLUMN IF NOT EXISTS hero_headline TEXT NOT NULL DEFAULT 'RobÃ³tica y STEAM para niÃ±os en Guatemala';


-- ========== migrations\016_landing_home_stats.sql ==========
-- EstadÃ­sticas editables de la banda en la home

ALTER TABLE public.landing_home
  ADD COLUMN IF NOT EXISTS stat_1_value TEXT NOT NULL DEFAULT '+500',
  ADD COLUMN IF NOT EXISTS stat_1_label TEXT NOT NULL DEFAULT 'Estudiantes',
  ADD COLUMN IF NOT EXISTS stat_2_value TEXT NOT NULL DEFAULT '4â€“17',
  ADD COLUMN IF NOT EXISTS stat_2_label TEXT NOT NULL DEFAULT 'AÃ±os de edad',
  ADD COLUMN IF NOT EXISTS stat_3_value TEXT NOT NULL DEFAULT '10+',
  ADD COLUMN IF NOT EXISTS stat_3_label TEXT NOT NULL DEFAULT 'AÃ±os en Guatemala',
  ADD COLUMN IF NOT EXISTS stat_4_value TEXT NOT NULL DEFAULT 'STEAM',
  ADD COLUMN IF NOT EXISTS stat_4_label TEXT NOT NULL DEFAULT 'RobÃ³tica y programaciÃ³n';


-- ========== migrations\017_landing_testimonios.sql ==========
-- Testimonios para la pÃ¡gina de inicio

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
    'MarÃ­a L.',
    'Madre de alumno',
    'Mi hijo llegÃ³ con curiosidad y hoy construye sus propios proyectos de robÃ³tica. EduKids despertÃ³ en Ã©l confianza para resolver problemas.',
    1,
    true
  ),
  (
    'Carlos R.',
    'Padre de familia',
    'Los talleres combinan diversiÃ³n y aprendizaje real. Se nota el mÃ©todo: los niÃ±os piensan, prueban y mejoran sus ideas en equipo.',
    2,
    true
  ),
  (
    'Prof. Ana M.',
    'Docente aliada',
    'EduKids acompaÃ±a con materiales claros y un enfoque maker que facilita integrar STEAM en el aula con entusiasmo.',
    3,
    true
  );

-- ========== migrations\018_cotizaciones.sql ==========
-- Cotizaciones de kits (ElectrÃ³nica DIY) + helper para primer admin

CREATE TABLE IF NOT EXISTS public.cotizaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero INT GENERATED BY DEFAULT AS IDENTITY,
  titulo TEXT NOT NULL DEFAULT 'Kit de robÃ³tica',
  cliente TEXT NOT NULL DEFAULT '',
  leyenda TEXT NOT NULL DEFAULT '',
  notas TEXT NOT NULL DEFAULT '',
  estado TEXT NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'enviada', 'aceptada', 'archivada')),
  costo NUMERIC(12, 2) NOT NULL DEFAULT 0,
  precio_venta NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ganancia NUMERIC(12, 2) NOT NULL DEFAULT 0,
  margen_pct NUMERIC(8, 2) NOT NULL DEFAULT 0,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cotizaciones_created_at ON public.cotizaciones(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_numero ON public.cotizaciones(numero DESC);

ALTER TABLE public.cotizaciones ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cotizaciones TO authenticated;

DROP POLICY IF EXISTS "cotizaciones_admin" ON public.cotizaciones;
CREATE POLICY "cotizaciones_admin" ON public.cotizaciones
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

DROP TRIGGER IF EXISTS cotizaciones_updated ON public.cotizaciones;
CREATE TRIGGER cotizaciones_updated BEFORE UPDATE ON public.cotizaciones
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.has_campus_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin');
$$;

GRANT EXECUTE ON FUNCTION public.has_campus_admin() TO anon, authenticated;

