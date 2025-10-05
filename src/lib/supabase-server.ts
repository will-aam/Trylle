import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createSupabaseServerClient = () => {
  // A função cookies() retorna uma Promise, então a variável cookieStore é uma Promise.
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Transformamos a função 'get' em async para poder usar 'await'
        get: async (name: string) => {
          // Esperamos a Promise do cookieStore ser resolvida e então chamamos .get()
          return (await cookieStore).get(name)?.value;
        },
        // Transformamos a função 'set' em async
        set: async (name: string, value: string, options: CookieOptions) => {
          try {
            // Esperamos a Promise e então chamamos .set()
            await (await cookieStore).set({ name, value, ...options });
          } catch (error) {
            // Erros podem ser ignorados em Server Components
          }
        },
        // Transformamos a função 'remove' em async
        remove: async (name: string, options: CookieOptions) => {
          try {
            // Esperamos a Promise e então chamamos .set() para remover
            await (await cookieStore).set({ name, value: "", ...options });
          } catch (error) {
            // Erros podem ser ignorados em Server Components
          }
        },
      },
    }
  );
};
