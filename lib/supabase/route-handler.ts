import { createServerClient } from "@supabase/ssr";

export function createClient(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return null;
  }
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        const cookieHeader = request.headers.get("cookie");
        if (!cookieHeader) return [];
        return cookieHeader.split(";").map((c) => {
          const [name, ...v] = c.trim().split("=");
          return { name: name!.trim(), value: v.join("=").trim() };
        });
      },
      setAll() {
        // En Route Handlers no actualizamos cookies aquí; el middleware se encarga
      },
    },
  });
}
