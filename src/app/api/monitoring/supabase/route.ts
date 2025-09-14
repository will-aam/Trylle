// src/app/api/monitoring/supabase/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use as variáveis de ambiente para segurança
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Limite do plano gratuito do Supabase (500MB)
const SUPABASE_FREE_TIER_LIMIT_GB = 0.5;

export async function GET() {
  try {
    // Query SQL para buscar o tamanho total do banco de dados
    const { data, error } = await supabaseAdmin.rpc("get_database_size_pretty");

    if (error) {
      throw error;
    }

    // Extrai o valor numérico e a unidade (ex: 150 MB)
    const [valueStr, unit] = data.split(" ");
    const value = parseFloat(valueStr);

    let usageGB = 0;
    if (unit === "MB") {
      usageGB = value / 1024;
    } else if (unit === "GB") {
      usageGB = value;
    } else if (unit === "kB") {
      usageGB = value / 1024 / 1024;
    }

    const usagePercentage = (usageGB / SUPABASE_FREE_TIER_LIMIT_GB) * 100;

    return NextResponse.json({
      usage: `${value} ${unit}`,
      limit: `${SUPABASE_FREE_TIER_LIMIT_GB} GB`,
      usagePercentage: Math.round(usagePercentage),
    });
  } catch (error: any) {
    console.error("Erro ao buscar dados do Supabase:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados do Supabase." },
      { status: 500 }
    );
  }
}
