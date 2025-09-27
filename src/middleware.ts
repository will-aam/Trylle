import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Crie um cliente Supabase para este request específico.
  // Isso é crucial para que a sessão seja atualizada corretamente.
  const supabase = createMiddlewareClient({ req, res });

  // A função mais importante: ela atualiza a sessão do usuário se necessário.
  // Isso garante que, quando o usuário volta do Google, a sessão dele é
  // reconhecida e salva antes de qualquer outra coisa.
  await supabase.auth.getSession();

  return res;
}

// Garante que o middleware seja executado em todas as rotas relevantes.
export const config = {
  matcher: [
    /*
     * Corresponde a todos os caminhos de solicitação, exceto aqueles que começam com:
     * - _next/static (arquivos estáticos)
     * - _next/image (arquivos de otimização de imagem)
     * - favicon.ico (arquivo de favicon)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
