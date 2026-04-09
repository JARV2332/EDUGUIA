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

## Comprobar que todo está bien

- En el Dashboard → **Table Editor** deberías ver: `docentes`, `estudiantes`, `sesiones_chat`, `planes_intervencion`.
- Al registrarte en la app, en `docentes` debería crearse una fila automáticamente (trigger `handle_new_user`).

## Clave anon (anon key)

Si más adelante la app da errores de autenticación, revisa en **Project Settings → API** que estés usando la **anon public** key (suele ser un JWT largo). Si en el Dashboard ves otra etiqueta (por ejemplo “publishable”), copia esa clave y actualiza `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local`.
