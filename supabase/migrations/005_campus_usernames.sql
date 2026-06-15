-- Usuario de acceso al campus (sin correo real): admin crea cuentas con username + contraseña

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
