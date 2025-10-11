// src/services/serverDataService.ts

import { createSupabaseServerClient } from "@/src/lib/supabase-server";
import { Category, Subcategory, Program, Tag, Episode } from "@/src/lib/types";

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

// NOVA FUNÇÃO CORRIGIDA
export type ScheduledEpisode = Pick<
  Episode,
  "id" | "title" | "published_at" // <- CORREÇÃO: Usando 'published_at'
> & {
  categories: Pick<Category, "name"> | null; // <- CORREÇÃO: Nomeado para 'categories'
  subcategories: Pick<Subcategory, "name"> | null; // <- CORREÇÃO: Nomeado para 'subcategories'
};

export async function getScheduledEpisodes(): Promise<ScheduledEpisode[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("episodes")
    .select(
      `
      id,
      title,
      published_at, 
      categories ( name ),
      subcategories ( name )
    `
    ) // <- CORREÇÃO: Usando 'published_at' e sintaxe de relação mais limpa
    .eq("status", "scheduled")
    .order("published_at", { ascending: true }); // <- CORREÇÃO: Usando 'published_at'

  if (error) {
    console.error("Error fetching scheduled episodes:", error);
    return [];
  }

  // O 'as any' é um truque para contornar um detalhe da tipagem do Supabase aqui.
  // Sabemos que os dados estão corretos, então forçamos a tipagem.
  return data as any;
}
