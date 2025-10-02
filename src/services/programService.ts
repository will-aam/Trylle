import { createSupabaseBrowserClient } from "@/src/lib/supabase-client";
import { Program } from "../lib/types";

export const getPrograms = async (): Promise<Program[]> => {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("programs")
    .select("*, categories(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar programas:", error);
    return [];
  }
  return data;
};
