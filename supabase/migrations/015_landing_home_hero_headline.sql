-- Titular principal editable del hero

ALTER TABLE public.landing_home
  ADD COLUMN IF NOT EXISTS hero_headline TEXT NOT NULL DEFAULT 'Robótica y STEAM para niños en Guatemala';
