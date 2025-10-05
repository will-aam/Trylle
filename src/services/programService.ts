import { createSupabaseServerClient } from "@/src/lib/supabase-server";
import { Program } from "../lib/types";

export const getPrograms = async (): Promise<Program[]> => {
  // A chamada aqui é síncrona, sem await
  const supabase = createSupabaseServerClient();

  // O único await é aqui, na chamada ao banco de dados
  const { data, error } = await supabase
    .from("programs")
    .select("*, categories(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar programas:", error);
    return [];
  }

  return data || [];
};
