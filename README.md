# EDUGUIA

Aplicación web (Next.js) para apoyo psicopedagógico inclusivo con evaluación adaptativa, informes con IA (Groq), integración Supabase y panel para docentes.

## Requisitos locales

- Node.js 20+
- Cuenta [Groq](https://console.groq.com/) y [Supabase](https://supabase.com/)

```bash
npm install
cp .env.example .env.local
# Edita .env.local con tus claves reales (no subas este archivo a Git)
npm run dev
```

### Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `GROQ_API_KEY` | Clave API de Groq (chat e informes IA) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anon (pública) de Supabase |

Ver también [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) para el esquema SQL.

## Subir el código a GitHub (repositorio `EDUGUIA`)

1. Crea un repositorio vacío en GitHub: [github.com/new](https://github.com/new) → nombre **EDUGUIA** (sin README ni .gitignore si ya existen en el proyecto).
2. En la carpeta del proyecto:

```bash
git remote add origin https://github.com/TU_USUARIO/EDUGUIA.git
git branch -M main
git push -u origin main
```

Sustituye `TU_USUARIO` por tu usuario u organización de GitHub.

## Desplegar en Vercel

1. Entra en [vercel.com](https://vercel.com) → **Add New Project** → importa el repo **EDUGUIA**.
2. Framework: **Next.js** (detección automática).
3. En **Environment Variables**, añade (mismos nombres que en `.env.local`):

   - `GROQ_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   Actívalas al menos para **Production** (y **Preview** si quieres previews con datos reales).

4. **Deploy**. La URL será algo como `https://eduguia-xxx.vercel.app`.

## Supabase (producción)

En Supabase → **Authentication** → **URL configuration**:

- **Site URL**: tu URL de Vercel (p. ej. `https://eduguia-xxx.vercel.app`).
- **Redirect URLs**: incluye la misma URL y `https://eduguia-xxx.vercel.app/**` si aplica según la documentación actual de Supabase.

Sin esto, el login OAuth/email puede fallar en producción.

## Licencia

Privado / uso del proyecto EDUGUIA.
