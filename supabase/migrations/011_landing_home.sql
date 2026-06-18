-- Contenido editable de la página de inicio (hero y secciones principales)

CREATE TABLE IF NOT EXISTS public.landing_home (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  hero_bg_url TEXT NOT NULL DEFAULT '/wp-content/uploads/2021/09/slider1-2-min.jpg',
  hero_tagline TEXT NOT NULL DEFAULT 'Educación para todos los niños',
  hero_logo_url TEXT NOT NULL DEFAULT '/assets/logo-edukids.png',
  hero_text TEXT NOT NULL DEFAULT 'Nuestro método educativo está basado en el método científico, de manera que se motiva al alumno a mejorar su autonomía y pensamiento crítico.',
  hero_btn_text TEXT NOT NULL DEFAULT 'Leer más',
  hero_btn_href TEXT NOT NULL DEFAULT '#nosotros',
  about_img_main TEXT NOT NULL DEFAULT '/wp-content/uploads/2021/09/imagen-2_optimized.png',
  about_img_secondary_1 TEXT NOT NULL DEFAULT '/wp-content/uploads/2021/09/imagen-3_optimized.png',
  about_img_secondary_2 TEXT NOT NULL DEFAULT '/wp-content/uploads/2021/09/imagen-1_optimized-3.png',
  about_paragraph_1 TEXT NOT NULL DEFAULT 'EDUKIDS es una empresa guatemalteca que cree firmemente en el potencial de cada guatemalteco. Preparamos a niñas y niños mediante la robótica para un mundo tecnológico y digital; ellos se involucran en su propio proceso de aprendizaje y potencian habilidades en áreas STEAM.',
  about_paragraph_2 TEXT NOT NULL DEFAULT 'Enseñamos robótica educativa integrando electrónica y programación a niños y jóvenes de 4 a 17 años, apostando por su desarrollo como personas y profesionales del siglo XXI.',
  enfoque_image_url TEXT NOT NULL DEFAULT '/wp-content/uploads/2019/08/portfolio-1a.jpg',
  enfoque_text TEXT NOT NULL DEFAULT 'Desarrollar la inteligencia y creatividad, fomentar el trabajo en equipo y resolver problemas con división de tareas. Los niños identifican los mejores componentes para cada reto, desarrollan habilidades sociales y refuerzan su autoestima.',
  metodo_image_url TEXT NOT NULL DEFAULT '/wp-content/uploads/2021/09/LOGO-EDU-KIDS.png',
  metodo_text TEXT NOT NULL DEFAULT 'Nuestro método se basa en el método científico: se motiva al alumno a mejorar su autonomía y pensamiento crítico, dejando que marquen los objetivos reales de los proyectos. Ensayan el método de prueba y error para estimular autonomía y confianza.',
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
