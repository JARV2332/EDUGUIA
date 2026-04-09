-- OPCIONAL: solo si ya existen tablas/políticas de EDUGUIA y quieres borrarlas y empezar de cero.
-- Ejecuta este bloque primero; luego ejecuta schema.sql completo.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DROP TRIGGER IF EXISTS sesiones_updated ON public.sesiones_chat;
DROP TRIGGER IF EXISTS estudiantes_updated ON public.estudiantes;
DROP TRIGGER IF EXISTS docentes_updated ON public.docentes;

DROP POLICY IF EXISTS "planes_docente" ON public.planes_intervencion;
DROP POLICY IF EXISTS "sesiones_docente" ON public.sesiones_chat;
DROP POLICY IF EXISTS "estudiantes_docente" ON public.estudiantes;
DROP POLICY IF EXISTS "docentes_own" ON public.docentes;

DROP TABLE IF EXISTS public.planes_intervencion CASCADE;
DROP TABLE IF EXISTS public.sesiones_chat CASCADE;
DROP TABLE IF EXISTS public.estudiantes CASCADE;
DROP TABLE IF EXISTS public.docentes CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
