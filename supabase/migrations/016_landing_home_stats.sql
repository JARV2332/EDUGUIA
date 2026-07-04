-- Estadísticas editables de la banda en la home

ALTER TABLE public.landing_home
  ADD COLUMN IF NOT EXISTS stat_1_value TEXT NOT NULL DEFAULT '+500',
  ADD COLUMN IF NOT EXISTS stat_1_label TEXT NOT NULL DEFAULT 'Estudiantes',
  ADD COLUMN IF NOT EXISTS stat_2_value TEXT NOT NULL DEFAULT '4–17',
  ADD COLUMN IF NOT EXISTS stat_2_label TEXT NOT NULL DEFAULT 'Años de edad',
  ADD COLUMN IF NOT EXISTS stat_3_value TEXT NOT NULL DEFAULT '10+',
  ADD COLUMN IF NOT EXISTS stat_3_label TEXT NOT NULL DEFAULT 'Años en Guatemala',
  ADD COLUMN IF NOT EXISTS stat_4_value TEXT NOT NULL DEFAULT 'STEAM',
  ADD COLUMN IF NOT EXISTS stat_4_label TEXT NOT NULL DEFAULT 'Robótica y programación';
