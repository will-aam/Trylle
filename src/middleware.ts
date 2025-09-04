import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Se o usuário não estiver logado, redireciona para a página de login
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // NOVO: Verifica se o usuário tem a função 'admin' nos seus metadados
  const userRole = session.user?.user_metadata?.role;
  if (userRole !== "admin") {
    // Se não for admin, não pode acessar /admin.
    // Podemos redirecioná-lo para a home ou mostrar uma página de "acesso negado".
    // Por enquanto, vamos redirecionar para a home.
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Se passou por todas as verificações, permite o acesso.
  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
