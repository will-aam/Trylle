// src/services/serverDataService.ts
import { createSupabaseServerClient } from "@/src/lib/supabase-server";
import { Category, Subcategory, Program, Tag } from "@/src/lib/types";

// Este arquivo contém funções de busca de dados destinadas APENAS a Componentes de Servidor.

export async function getCategoriesForServer(): Promise<Category[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching categories for server:", error.message);
    return [];
  }
  return data || [];
}

export async function getSubcategoriesForServer(): Promise<Subcategory[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("subcategories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching subcategories for server:", error.message);
    return [];
  }
  return data || [];
}

export async function getProgramsForServer(): Promise<Program[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("programs").select(`*`);

  if (error) {
    console.error("Error fetching programs for server:", error.message);
    return [];
  }
  return data || [];
}

export async function getTagsForServer(): Promise<Tag[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching tags for server:", error.message);
    return [];
  }
  return data || [];
}
