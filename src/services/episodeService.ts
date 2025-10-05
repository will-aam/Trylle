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
  const { tags, page_count, reference_count, ...episodeData } = updates;

  const { data: updatedEpisode, error: episodeError } = await supabase
    .from("episodes")
    .update(episodeData)
    .eq("id", episodeId)
    .select()
    .single();

  if (episodeError) {
    throw new Error(episodeError.message);
  }

  const { data: existingDocument } = await supabase
    .from("episode_documents")
    .select("id")
    .eq("episode_id", episodeId)
    .single();

  if (existingDocument) {
    const { error: documentError } = await supabase
      .from("episode_documents")
      .update({
        page_count: page_count,
        reference_count: reference_count,
      })
      .eq("id", existingDocument.id);

    if (documentError) {
      console.error("Erro ao atualizar o documento:", documentError.message);
    }
  }

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

// ADICIONANDO AS FUNÇÕES QUE FALTAVAM AQUI

/**
 * Deleta um documento de episódio do armazenamento e do banco de dados.
 */
export const deleteEpisodeDocument = async (
  documentId: string,
  storagePath: string
): Promise<void> => {
  const { error: storageError } = await supabase.storage
    .from("episode-documents")
    .remove([storagePath]);

  if (storageError) {
    console.error("Erro ao deletar arquivo do storage:", storageError.message);
    throw new Error("Ocorreu um erro ao remover o arquivo do armazenamento.");
  }

  const { error: dbError } = await supabase
    .from("episode_documents")
    .delete()
    .eq("id", documentId);

  if (dbError) {
    console.error("Erro ao deletar referência do documento:", dbError.message);
    throw new Error("Não foi possível deletar a referência do documento.");
  }
};

/**
 * Faz o upload de um novo documento e o associa a um episódio.
 */
export const uploadEpisodeDocument = async (
  episodeId: string,
  documentFile: File
): Promise<any> => {
  const filePath = `documents/${episodeId}-${Date.now()}-${documentFile.name}`;

  const { error: storageError } = await supabase.storage
    .from("episode-documents")
    .upload(filePath, documentFile);

  if (storageError) {
    console.error("Erro no upload do documento para o storage:", storageError);
    throw new Error("Falha no upload do arquivo do documento.");
  }

  const { data: urlData } = supabase.storage
    .from("episode-documents")
    .getPublicUrl(filePath);

  const { data: newDocument, error: dbError } = await supabase
    .from("episode_documents")
    .insert({
      episode_id: episodeId,
      file_name: documentFile.name,
      storage_path: filePath,
      public_url: urlData.publicUrl,
      file_size: documentFile.size,
    })
    .select()
    .single();

  if (dbError) {
    console.error("Erro ao salvar referência do documento:", dbError);
    throw new Error("Não foi possível salvar a referência do novo documento.");
  }

  return newDocument;
};
