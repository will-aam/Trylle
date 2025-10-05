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
  // Ajuste esta linha para incluir os novos campos
  const { tags, page_count, reference_count, ...episodeData } = updates;

  // ETAPA 1: ATUALIZAÇÃO
  // Voltamos a usar .single() para que o próprio Supabase nos dê o erro
  // se ele não encontrar exatamente uma linha para atualizar e retornar.
  const { data: updatedEpisode, error: episodeError } = await supabase
    .from("episodes")
    .update(episodeData)
    .eq("id", episodeId)
    .select()
    .single();

  // Se a atualização falhar, lança o erro específico do Supabase.
  if (episodeError) {
    // A mensagem de erro agora será a original do Supabase (ex: "multiple (or no) rows returned")
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
      // Mesmo com erro aqui, continuamos para não travar a edição inteira
      console.error("Erro ao atualizar o documento:", documentError.message);
    }
  }

  // ETAPA 2: ATUALIZAÇÃO DAS TAGS
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

  // ETAPA 3: BUSCA FINAL DOS DADOS
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

import { z } from "zod";
import { episodeSchema } from "@/src/lib/schemas";

// Função para fazer o upload de um arquivo para o Supabase Storage
async function uploadFile(file: File, bucket: string): Promise<string> {
  const filePath = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) {
    console.error("Supabase upload error:", error);
    throw new Error(`Falha no upload do arquivo para o bucket ${bucket}.`);
  }
  return data.path;
}

// Tipo inferido do nosso novo schema
type EpisodeFormData = z.infer<typeof episodeSchema>;

// Função para criar um novo episódio (publicado ou rascunho)
async function createNewEpisode(
  values: EpisodeFormData,
  status: "published" | "draft"
): Promise<void> {
  const validatedData = episodeSchema.parse(values);

  const { audio_file, document_file, tags, ...episodeDetails } = validatedData;

  // 1. Upload do Áudio
  if (!audio_file) throw new Error("O arquivo de áudio é obrigatório.");
  const audioPath = await uploadFile(audio_file, "episode-audios");
  const { publicUrl: audio_url } = supabase.storage
    .from("episode-audios")
    .getPublicUrl(audioPath).data;

  // 2. Insere o episódio no banco
  const { data: newEpisode, error: episodeError } = await supabase
    .from("episodes")
    .insert({
      ...episodeDetails,
      audio_url: audio_url,
      status: status,
      // Garante que category_id seja um número
      category_id: parseInt(validatedData.category_id, 10),
      // Garante que subcategory_id seja um número ou nulo
      subcategory_id: validatedData.subcategory_id
        ? parseInt(validatedData.subcategory_id, 10)
        : null,
    })
    .select()
    .single();

  if (episodeError) {
    console.error("Episode creation error:", episodeError);
    throw new Error("Não foi possível criar o episódio.");
  }

  // 3. Upload do Documento (se existir)
  if (document_file) {
    const docPath = await uploadFile(document_file, "episode-documents");
    const { publicUrl: document_url } = supabase.storage
      .from("episode-documents")
      .getPublicUrl(docPath).data;

    const { error: docError } = await supabase
      .from("episode_documents")
      .insert({
        episode_id: newEpisode.id,
        file_path: docPath,
        file_url: document_url,
        file_size: document_file.size,
        page_count: values.page_count, // Assumindo que você adicione isso ao form
        reference_count: values.reference_count, // Assumindo que você adicione isso ao form
      });
    if (docError) console.error("Document creation error:", docError.message);
  }

  // 4. Associa as Tags (se existirem)
  if (tags && tags.length > 0) {
    const episodeTags = tags.map((tagId) => ({
      episode_id: newEpisode.id,
      tag_id: parseInt(tagId, 10), // Garante que a tag_id seja um número
    }));
    const { error: tagsError } = await supabase
      .from("episode_tags")
      .insert(episodeTags);
    if (tagsError) console.error("Tag association error:", tagsError.message);
  }
}

export const createEpisode = (values: EpisodeFormData) =>
  createNewEpisode(values, "published");
export const createDraftEpisode = (values: EpisodeFormData) =>
  createNewEpisode(values, "draft");
