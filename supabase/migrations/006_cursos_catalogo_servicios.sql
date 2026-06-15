-- Campos de catálogo público (página /servicios) para cursos publicados

ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS precio NUMERIC(10, 2);
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS precio_moneda TEXT NOT NULL DEFAULT 'GTQ';
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS duracion TEXT;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS modalidad TEXT;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS edad_publico TEXT;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS orden_servicios INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_cursos_orden_servicios ON public.cursos(orden_servicios);
