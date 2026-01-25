// src/app/api/monitoring/supabase/route.ts
import { createSupabaseServerClient } from "@/src/lib/supabase-server";
import { NextResponse } from "next/server";

// CRUCIAL: Garante que o Next.js não faça cache dessa rota.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Inicializa o cliente do Supabase (agora com await e o nome correto)
    const supabase = await createSupabaseServerClient();

    // Executa uma query leve (HEAD) na tabela de categorias
    // Isso conta como atividade de leitura no banco
    const { count, error } = await supabase
      .from("categories")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Supabase Keep-Alive Error:", error);
      return NextResponse.json(
        { status: "error", error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        status: "active",
        timestamp: new Date().toISOString(),
        check: "database-alive",
        recordCount: count,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { status: "error", error: String(error) },
      { status: 500 },
    );
  }
}
