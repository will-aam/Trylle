import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// Torna a função assíncrona
export const createSupabaseServerClient = async () => {
  // Aguarda a promise dos cookies ser resolvida
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // O erro é ignorado intencionalmente pois o método set
            // pode ser chamado de um Server Component onde não é permitido.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // O erro é ignorado intencionalmente.
          }
        },
      },
    },
  );
};
