import { createSupabaseBrowserClient } from "@/src/lib/supabase-client";
import { Subcategory } from "../lib/types";

/**
 * Busca todas as subcategorias do banco de dados.
 */
export const getSubcategories = async (): Promise<Subcategory[]> => {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("subcategories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Erro ao buscar subcategorias:", error);
    return [];
  }

  return data;
};
