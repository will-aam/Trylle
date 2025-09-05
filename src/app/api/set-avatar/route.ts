import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente Admin: inicializado com a chave de serviço para ter superpoderes
const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Token ausente" }, { status: 401 });
    }

    // Cliente de Usuário: verifica o token do usuário que fez a requisição
    const {
      data: { user },
      error,
    } = await createClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
      }
    ).auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Se o usuário já tem um avatar, não faz nada.
    if (user.user_metadata?.avatar_url) {
      return NextResponse.json({
        ok: true,
        avatar: user.user_metadata.avatar_url,
      });
    }

    // Gera a URL do DiceBear
    const seed = encodeURIComponent(
      user.user_metadata?.name || user.email || user.id
    );
    const avatarUrl = `https://api.dicebear.com/8.x/thumbs/svg?seed=${seed}`;

    // Atualiza os metadados do usuário usando o cliente Admin
    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: { ...(user.user_metadata || {}), avatar_url: avatarUrl },
      });

    if (updateError) {
      console.error("Erro do Supabase Admin ao atualizar:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, avatar: avatarUrl });
  } catch (err: any) {
    console.error("Erro inesperado na API set-avatar:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
