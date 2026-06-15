-- LMS MVP: roles, cursos, materiales, tareas y matrículas

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
