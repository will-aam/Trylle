"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/src/lib/supabase-server";
import { Episode, Tag, EpisodeDocument } from "@/src/lib/types";

/**
 * Schema de payload (espelha o usado no front, mas todos opcionais).
 * tags: string[] (IDs). Se não for enviado, não altera pivot.
 */
const updateEpisodeServerSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  program_id: z.string().nullable().optional(),
  episode_number: z.number().int().positive().optional(),
  category_id: z.string().optional(),
  subcategory_id: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(), // IDs
});

/**
 * Tipo inferido do schema.
 */
export type UpdateEpisodeServerInput = z.infer<
  typeof updateEpisodeServerSchema
>;

/**
 * Tipo de retorno da action.
 */
export type UpdateEpisodeResult =
  | { success: true; episode: Episode }
  | { success: false; error: string; code?: string };

interface RawEpisodeRow {
  id: string;
  title: string;
  description: string | null;
  audio_url: string;
  file_name: string;
  category_id: string | null;
  subcategory_id: string | null;
  status: "draft" | "scheduled" | "published";
  published_at: string;
  created_at: string;
  updated_at: string;
  duration_in_seconds: number | null;
  view_count: number;
  program_id: string | null;
  episode_number: number | null;

  // Relações (nomes dependem do select)
  episode_documents?: {
    id: string;
    episode_id: string;
    file_name: string;
    public_url: string;
    storage_path: string;
    created_at?: string;
    file_size?: number | null;
    page_count?: number | null;
    reference_count?: number | null;
  }[];

  // Join pivot -> tags
  episode_tags?: {
    tag: {
      id: string;
      name: string;
      created_at: string;
    } | null;
  }[];
}

/**
 * Função util para reconstruir o objeto Episode a partir do row cru (com join).
 */
function mapRawToEpisode(row: RawEpisodeRow): Episode {
  const tags: Tag[] =
    row.episode_tags
      ?.map((et) => et.tag)
      .filter((t): t is Tag => !!t)
      .map((t) => ({
        id: t.id,
        name: t.name,
        created_at: t.created_at,
      })) || [];

  const episodeDocuments: EpisodeDocument[] | null =
    row.episode_documents?.map((d) => ({
      id: d.id,
      episode_id: d.episode_id,
      file_name: d.file_name,
      public_url: d.public_url,
      storage_path: d.storage_path,
      created_at: d.created_at,
      file_size: d.file_size,
      page_count: d.page_count,
      reference_count: d.reference_count,
    })) || null;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    audio_url: row.audio_url,
    file_name: row.file_name,
    category_id: row.category_id,
    subcategory_id: row.subcategory_id,
    status: row.status,
    published_at: row.published_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    duration_in_seconds: row.duration_in_seconds,
    view_count: row.view_count,
    tags,
    program_id: row.program_id,
    episode_number: row.episode_number,
    categories: undefined,
    subcategories: undefined,
    programs: undefined,
    episode_documents: episodeDocuments,
  };
}

/**
 * Atualiza um episódio.
 * @param episodeId ID do episódio
 * @param partialUpdates Campos opcionais para atualizar
 */
export async function updateEpisodeAction(
  episodeId: string,
  partialUpdates: Partial<UpdateEpisodeServerInput>
): Promise<UpdateEpisodeResult> {
  const supabase = await createSupabaseServerClient();

  // 1. Validação do payload
  const parse = updateEpisodeServerSchema.safeParse(partialUpdates);
  if (!parse.success) {
    return {
      success: false,
      error: parse.error.issues.map((i) => i.message).join("; "),
      code: "INVALID_PAYLOAD",
    };
  }
  const data = parse.data;

  // 2. Separar tags de outros campos
  const { tags, ...episodeFieldUpdates } = data;

  // 3. Limpar undefined (para não sobrescrever com undefined)
  const cleaned: Record<string, any> = {};
  Object.entries(episodeFieldUpdates).forEach(([k, v]) => {
    if (v !== undefined) cleaned[k] = v;
  });

  // Se nada além de tags mudou, podemos pular direto pro pivot
  const shouldUpdateRow = Object.keys(cleaned).length > 0;

  // 4. Atualizar row principal (se necessário)
  if (shouldUpdateRow) {
    cleaned.updated_at = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("episodes")
      .update(cleaned)
      .eq("id", episodeId);

    if (updateError) {
      return {
        success: false,
        error: updateError.message,
        code: updateError.code,
      };
    }
  }

  // 5. Atualizar pivot de tags (somente se 'tags' foi enviado)
  if (tags) {
    // Buscar tags já vinculadas
    const { data: existingPivot, error: pivotSelectError } = await supabase
      .from("episode_tags")
      .select("tag_id")
      .eq("episode_id", episodeId);

    if (pivotSelectError) {
      return {
        success: false,
        error: pivotSelectError.message,
        code: pivotSelectError.code,
      };
    }

    const existingIds = (existingPivot || []).map((r) => r.tag_id as string);
    const incomingIds = Array.from(new Set(tags)); // deduplicar

    const toAdd = incomingIds.filter((id) => !existingIds.includes(id));
    const toRemove = existingIds.filter((id) => !incomingIds.includes(id));

    if (toAdd.length > 0) {
      const insertPayload = toAdd.map((tagId) => ({
        episode_id: episodeId,
        tag_id: tagId,
      }));
      const { error: insertError } = await supabase
        .from("episode_tags")
        .insert(insertPayload);
      if (insertError) {
        return {
          success: false,
          error: insertError.message,
          code: insertError.code,
        };
      }
    }

    if (toRemove.length > 0) {
      const { error: deleteError } = await supabase
        .from("episode_tags")
        .delete()
        .eq("episode_id", episodeId)
        .in("tag_id", toRemove);
      if (deleteError) {
        return {
          success: false,
          error: deleteError.message,
          code: deleteError.code,
        };
      }
    }
  }

  // 6. Buscar episódio atualizado + joins
  const { data: updatedRow, error: fetchError } = await supabase
    .from("episodes")
    .select(
      `
      id,
      title,
      description,
      audio_url,
      file_name,
      category_id,
      subcategory_id,
      status,
      published_at,
      created_at,
      updated_at,
      duration_in_seconds,
      view_count,
      program_id,
      episode_number,
      episode_documents (
        id,
        episode_id,
        file_name,
        public_url,
        storage_path,
        created_at,
        file_size,
        page_count,
        reference_count
      ),
      episode_tags:episode_tags (
        tag:tags (
          id,
          name,
          created_at
        )
      )
      `
    )
    .eq("id", episodeId)
    .single<RawEpisodeRow>();

  if (fetchError || !updatedRow) {
    return {
      success: false,
      error: fetchError?.message || "Falha ao carregar episódio atualizado.",
      code: fetchError?.code,
    };
  }

  // 7. Revalidar a página de listagem/admin
  revalidatePath("/admin/episodes");

  // 8. Mapear e retornar
  const episode = mapRawToEpisode(updatedRow);
  return { success: true, episode };
}
