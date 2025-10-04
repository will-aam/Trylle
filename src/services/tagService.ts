// src/services/tagService.ts
import { createSupabaseBrowserClient } from "@/src/lib/supabase-client";
import { Tag } from "../lib/types";

export const getTags = async (): Promise<Tag[]> => {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Erro ao buscar tags:", error);
    return [];
  }
  return data;
};
