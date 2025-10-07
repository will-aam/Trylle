// src/services/episodeService.ts

import { createSupabaseServerClient } from "@/src/lib/supabase-server";
import { Episode } from "@/src/lib/types";

type GetEpisodesParams = {
  limit?: number;
  offset?: number;
  searchTerm?: string;
  status?: string;
  categoryId?: string;
  sortBy?: string;
  ascending?: boolean;
};

export const getEpisodesWithRelations = async (
  params: GetEpisodesParams
): Promise<Episode[]> => {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("episodes")
    .select(
      `
      *,
      categories (name),
      subcategories (name),
      programs (title),
      episode_documents (*),
      tags (*)
    `
    )
    .order(params.sortBy || "published_at", { ascending: params.ascending })
    .range(params.offset || 0, (params.offset || 0) + (params.limit || 10) - 1);

  if (params.searchTerm) query = query.ilike("title", `%${params.searchTerm}%`);
  if (params.status && params.status !== "all")
    query = query.eq("status", params.status);
  if (params.categoryId && params.categoryId !== "all")
    query = query.eq("category_id", params.categoryId);

  const { data, error } = await query;
  if (error) {
    console.error("Erro ao carregar episódios:", error.message);
    throw new Error("Não foi possível carregar os episódios.");
  }
  return (data as any) || [];
};

export const getEpisodesCount = async (
  params: Omit<GetEpisodesParams, "limit" | "offset" | "sortBy" | "ascending">
): Promise<number> => {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("episodes")
    .select("*", { count: "exact", head: true });

  if (params.searchTerm) query = query.ilike("title", `%${params.searchTerm}%`);
  if (params.status && params.status !== "all")
    query = query.eq("status", params.status);
  if (params.categoryId && params.categoryId !== "all")
    query = query.eq("category_id", params.categoryId);

  const { count, error } = await query;
  if (error) {
    console.error("Erro ao contar os episódios:", error.message);
    throw new Error("Não foi possível contar os episódios.");
  }
  return count || 0;
};
