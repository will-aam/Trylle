// src/services/episodeService.ts
import { createSupabaseBrowserClient } from "@/src/lib/supabase-client";
import { Episode } from "@/src/lib/types";

const supabase = createSupabaseBrowserClient();

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
  if (error) throw new Error("Não foi possível carregar os episódios.");
  return (data as any) || [];
};

export const getEpisodes = async (
  params: GetEpisodesParams
): Promise<Episode[]> => {
  return getEpisodesWithRelations(params);
};

export const getEpisodesCount = async (
  params: Omit<GetEpisodesParams, "limit" | "offset" | "sortBy" | "ascending">
): Promise<number> => {
  let query = supabase
    .from("episodes")
    .select("*", { count: "exact", head: true });
  if (params.searchTerm) query = query.ilike("title", `%${params.searchTerm}%`);
  if (params.status && params.status !== "all")
    query = query.eq("status", params.status);
  if (params.categoryId && params.categoryId !== "all")
    query = query.eq("category_id", params.categoryId);
  const { count, error } = await query;
  if (error) throw new Error("Não foi possível contar os episódios.");
  return count || 0;
};

export const updateEpisode = async (
  episodeId: string,
  updates: any
): Promise<Episode> => {
  const { tags, ...episodeData } = updates;

  // 1. Atualiza os dados do episódio e VERIFICA se a operação foi bem-sucedida
  // A linha abaixo é a versão correta e final
  const { error: episodeError } = await supabase
    .from("episodes")
    .update(episodeData)
    .eq("id", episodeId)
    .select()
    .single();

  if (episodeError) {
    throw new Error(
      `Não foi possível atualizar o episódio. Erro: ${episodeError.message}`
    );
  }

  // 2. Atualiza as tags (relação many-to-many)
  const { error: deleteTagsError } = await supabase
    .from("episode_tags")
    .delete()
    .eq("episode_id", episodeId);
  if (deleteTagsError)
    throw new Error("Não foi possível atualizar as tags (erro ao remover).");

  if (tags && tags.length > 0) {
    const newEpisodeTags = tags.map((tagId: string) => ({
      episode_id: episodeId,
      tag_id: tagId,
    }));
    const { error: insertTagsError } = await supabase
      .from("episode_tags")
      .insert(newEpisodeTags);
    if (insertTagsError)
      throw new Error("Não foi possível atualizar as tags (erro ao inserir).");
  }

  // 3. Retorna o episódio atualizado com todas as suas relações
  const { data: finalEpisode, error: finalError } = await supabase
    .from("episodes")
    .select(
      `*, categories(name), subcategories(name), programs(title), episode_documents(*), tags(*)`
    )
    .eq("id", episodeId)
    .single();

  if (finalError)
    throw new Error(
      "Episódio atualizado, mas houve um erro ao buscar os dados finais."
    );

  return finalEpisode as any;
};

export const deleteEpisode = async (episodeId: string): Promise<void> => {
  const { error } = await supabase
    .from("episodes")
    .delete()
    .eq("id", episodeId);
  if (error) throw new Error("Não foi possível deletar o episódio.");
};
