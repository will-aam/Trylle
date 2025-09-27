import { createRouteHandlerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      // Se houver um erro aqui, não podemos continuar.
      console.error("Supabase exchange code error:", error);
      // Redireciona de volta para a página de login com uma mensagem de erro
      return NextResponse.redirect(
        new URL("/auth?error=Could not authenticate user", request.url)
      );
    }
  }

  // AGORA que a sessão foi estabelecida, buscamos o usuário.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Verificamos os metadados do usuário para a role de admin.
  if (user?.user_metadata?.role === "admin") {
    // Se for admin, redireciona para a página de admin.
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Para todos os outros, redireciona para a página principal.
  // A aplicação agora reconhecerá a sessão e mostrará a página de usuário logado.
  return NextResponse.redirect(new URL("/", request.url));
}
