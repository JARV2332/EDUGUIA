# Configuración de Supabase para EDUGUIA

Las variables de entorno ya están en `.env.local` con tu proyecto.

## Crear las tablas en tu proyecto Supabase

Elige **una** de estas dos opciones.

### Opción A: SQL Editor (recomendado, sin CLI)

1. Entra a tu proyecto: **https://supabase.com/dashboard/project/tvqbhxprglnrkvrfawqi**
2. En el menú izquierdo abre **SQL Editor**.
3. Pulsa **New query**.
4. Copia todo el contenido del archivo **`supabase/schema.sql`** del proyecto y pégalo en el editor.
5. Pulsa **Run** (o Ctrl+Enter).

Con eso se crean las tablas `docentes`, `estudiantes`, `sesiones_chat`, `planes_intervencion`, RLS, triggers y la función que crea el perfil docente al registrarse.

### Opción B: Supabase CLI (migraciones)

Si tienes [Supabase CLI](https://supabase.com/docs/guides/cli) instalado:

```bash
# Enlazar tu proyecto (te pedirá la contraseña de la base de datos si es la primera vez)
npx supabase link --project-ref tvqbhxprglnrkvrfawqi

# Aplicar las migraciones (crea las tablas en la nube)
npx supabase db push
```

La contraseña de la base de datos la ves en: Dashboard → Project Settings → Database → Database password.

---

## Perfil docente y avatares

Ejecuta también **`supabase/migrations/002_teacher_profile.sql`** (o el bloque equivalente en `schema.sql`):

- Columna `escuela` en `docentes`
- Bucket Storage `teacher-avatars` para fotos de perfil

En **Storage → Policies** debe permitir que cada docente suba solo a su carpeta (`auth.uid()`).

## Campus virtual (LMS EduKids)

Ejecuta **`supabase/migrations/003_lms_mvp.sql`** para:

- Tabla `profiles` con roles: `admin`, `docente`, `estudiante`, `lms_docente`
- Tabla `alumnos` (cuentas de estudiantes del LMS)
- Tablas `cursos`, `modulos`, `materiales`, `tareas`, `matriculas`, `entregas`
- Bucket Storage `course-materials` para archivos de curso

Ejecuta **`supabase/migrations/004_lms_eduguia_separation.sql`** para separar cuentas:

- **EDUGUIA** (`app: "eduguia"` en registro) → tabla `docentes`, panel `/dashboard`
- **Campus EduKids** (`app: "edukids_lms"`) → roles `estudiante`, `lms_docente`, `admin`
- Tabla `instructores` para docentes del LMS (no mezclar con `docentes` de EDUGUIA)
- Columna `cursos.instructor_id` para asignar cursos a docentes del campus

### Crear un administrador del campus

1. En Supabase → **Authentication → Users** crea un usuario o edita uno existente.
2. En **User Metadata** agrega: `{ "app": "edukids_lms", "role": "admin", "nombre": "Tu nombre" }`
3. Si el usuario ya existía, ejecuta en SQL Editor:

```sql
INSERT INTO public.profiles (id, role, nombre)
SELECT id, 'admin', email FROM auth.users WHERE email = 'admin@tudominio.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### Flujo del campus (separado de EDUGUIA)

| Producto | Login | Registro | Panel |
|----------|-------|----------|-------|
| **EDUGUIA** (inclusión docente) | `/login` | `/register` | `/dashboard` |
| Estudiante campus | `/campus/login?role=estudiante` | `/campus/register?role=estudiante` | `/alumno` |
| Docente campus | `/campus/login?role=lms_docente` | `/campus/register?role=lms_docente` | `/campus/docente` |
| Admin campus | `/campus/login?role=admin` | Solo manual en Supabase | `/admin` |

Hub del campus: **`/acceso`**. La landing en `/` enlaza campus y EDUGUIA por separado.

### Crear estudiantes y docentes desde el admin (sin correo)

1. Ejecuta **`supabase/migrations/005_campus_usernames.sql`** (columna `username` en `profiles`).
2. En Vercel / `.env.local` agrega **`SUPABASE_SERVICE_ROLE_KEY`** (Dashboard → Settings → API → `service_role`, solo servidor).
3. Entra como admin en **`/admin/usuarios`**.
4. Crea la cuenta con **nombre**, **usuario** (ej. `maria.garcia`) y **contraseña**.
5. El estudiante o docente entra en **`/campus/login`** con ese usuario y contraseña (no se envía correo de verificación).

Los usuarios internos usan correo técnico `usuario@campus.edukids.local`; el login acepta solo el nombre de usuario.

### Cursos publicados en /servicios

Ejecuta **`supabase/migrations/006_cursos_catalogo_servicios.sql`** y **`007_cursos_public_read.sql`** (precio, duración y lectura pública en /servicios).

En **`/admin/cursos`**, completa el catálogo (precio, duración, edades, imagen) y activa **Publicar**. El curso aparece automáticamente en [https://eduguia.vercel.app/servicios/](https://eduguia.vercel.app/servicios/) vía la API pública `/api/public/cursos`. Si hay cursos publicados, reemplazan el listado estático de la página.

### Formulario de contacto (sin abrir WhatsApp al visitante)

Cuando alguien envía el formulario en **`/comunicate-con-nosotros`**:

1. El mensaje se **guarda en Supabase** (tabla `contactos`).
2. Lo ves en **`/admin/contactos`** dentro del panel admin.
3. (Opcional) Si configuras **Resend**, también llega un **correo** a `info@edukidsgt.com`.

**Migración:** ejecuta **`supabase/migrations/008_contactos.sql`** en el SQL Editor.

**Correo opcional (Resend):**

1. Crea cuenta en [resend.com](https://resend.com) y verifica tu dominio (o usa el dominio de prueba al inicio).
2. En Vercel agrega:
   - `RESEND_API_KEY` = tu API key de Resend
   - `CONTACT_NOTIFY_EMAIL` = `info@edukidsgt.com` (opcional)
   - `CONTACT_FROM_EMAIL` = `EduKids GT <noreply@tudominio.com>` (opcional)

El visitante solo ve “¡Gracias! Recibimos tu mensaje”. Tú revisas **`/admin/contactos`** o tu correo.

> **Nota:** Enviar WhatsApp automático a tu teléfono sin que el visitante vea nada requiere servicios externos (CallMeBot, Meta Business API, Twilio, etc.). Esta solución evita eso y usa tu Supabase + correo.

---

## Recuperación de contraseña

1. En **Authentication → URL Configuration** agrega estas **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://TU-DOMINIO.vercel.app/auth/callback` (producción)
2. El flujo usa `/forgot-password` → correo de Supabase → `/auth/callback` → `/reset-password`.

## Línea de tiempo (timeline)

Las entradas de seguimiento diario se guardan en Supabase dentro del campo JSONB `assessment_data.timeline` de cada estudiante. Al iniciar sesión en otro navegador, se cargan automáticamente desde la nube.

---

- En el Dashboard → **Table Editor** deberías ver: `docentes`, `estudiantes`, `sesiones_chat`, `planes_intervencion`.
- Al registrarte en la app, en `docentes` debería crearse una fila automáticamente (trigger `handle_new_user`).

## Clave anon (anon key)

Si más adelante la app da errores de autenticación, revisa en **Project Settings → API** que estés usando la **anon public** key (suele ser un JWT largo). Si en el Dashboard ves otra etiqueta (por ejemplo “publishable”), copia esa clave y actualiza `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local`.
