import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  if (code) {
    // A troca do código pela sessão acontece aqui e o cookie de sessão é salvo.
    await supabase.auth.exchangeCodeForSession(code);
  }

  // --- LÓGICA DE VERIFICAÇÃO DE ADMIN ---

  // Após a sessão ser criada, buscamos os dados do usuário.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Verificamos se o usuário é um admin.
  if (user?.user_metadata?.role === "admin") {
    // Se for admin, redirecionamos para a página de admin.
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Para todos os outros usuários, redirecionamos para a página principal.
  // O middleware e a página principal irão então reconhecer a sessão e mostrar a versão logada.
  return NextResponse.redirect(new URL("/", request.url));
}
