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
