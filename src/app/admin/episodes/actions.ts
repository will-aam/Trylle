"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/src/lib/supabase-server";
import { Episode, Tag, EpisodeDocument } from "@/src/lib/types";

/**
 * Schema compartilhado de UPDATE (já existente) – mantido.
 */
const updateEpisodeServerSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  program_id: z.string().nullable().optional(),
  episode_number: z.number().int().positive().optional(),
  category_id: z.string().optional(),
  subcategory_id: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["draft", "scheduled", "published"]).optional(),
});
export type UpdateEpisodeServerInput = z.infer<
  typeof updateEpisodeServerSchema
>;

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
  episode_tags?: {
    tag: {
      id: string;
      name: string;
      created_at: string;
    } | null;
  }[];
}

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

/* =========================================================
 * CREATE EPISODE
 * =======================================================*/

const createEpisodeSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable(),
  audio_url: z.string().url(),
  file_name: z.string().min(1),
  program_id: z.string().nullable(),
  episode_number: z.number().int().positive().nullable(),
  category_id: z.string().nullable(),
  subcategory_id: z.string().nullable(),
  published_at: z.string().datetime(),
  status: z.enum(["draft", "scheduled", "published"]),
  duration_in_seconds: z.number().int().positive().nullable(),
  tagIds: z.array(z.string()).default([]),
});

export type CreateEpisodeInput = z.infer<typeof createEpisodeSchema>;

export type CreateEpisodeResult =
  | { success: true; episode: Episode }
  | { success: false; error: string; code?: string };

export async function createEpisodeAction(
  payload: CreateEpisodeInput
): Promise<CreateEpisodeResult> {
  try {
    const supabase = await createSupabaseServerClient();

    // 1. Validar payload
    const parsed = createEpisodeSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join("; "),
        code: "INVALID_PAYLOAD",
      };
    }
    const data = parsed.data;

    // 2. Regras de coerência (pode ajustar conforme suas políticas)
    const now = new Date();
    let publishedAtISO = data.published_at;
    const givenDate = new Date(data.published_at);

    // Exemplo de ajustes opcionais:
    if (data.status === "published" && givenDate > now) {
      // Força para agora (ou poderia forçar status=scheduled)
      publishedAtISO = now.toISOString();
    }
    if (data.status === "scheduled" && givenDate <= now) {
      // Regride para draft se data não está no futuro
      return {
        success: false,
        error: "Data de publicação precisa ser futura para status 'scheduled'.",
        code: "INVALID_SCHEDULE_DATE",
      };
    }

    // 3. Inserir episódio
    const insertPayload = {
      title: data.title,
      description: data.description,
      audio_url: data.audio_url,
      file_name: data.file_name,
      program_id: data.program_id,
      episode_number: data.episode_number,
      category_id: data.category_id,
      subcategory_id: data.subcategory_id,
      published_at: publishedAtISO,
      status: data.status,
      duration_in_seconds: data.duration_in_seconds,
      view_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: inserted, error: insertErr } = await supabase
      .from("episodes")
      .insert(insertPayload)
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
        episode_number
      `
      )
      .single<RawEpisodeRow>();

    if (insertErr || !inserted) {
      return {
        success: false,
        error: insertErr?.message || "Falha ao inserir episódio.",
        code: insertErr?.code,
      };
    }

    const episodeId = inserted.id;

    // 4. Inserir tags (pivot) se houver
    if (data.tagIds.length > 0) {
      const pivotRows = data.tagIds.map((tagId) => ({
        episode_id: episodeId,
        tag_id: tagId,
      }));
      const { error: pivotErr } = await supabase
        .from("episode_tags")
        .insert(pivotRows);
      if (pivotErr) {
        // Decide: reverter episódio? (aqui não removemos; apenas retornamos warning)
        return {
          success: false,
          error:
            "Episódio criado, mas falha ao vincular tags: " + pivotErr.message,
          code: pivotErr.code,
        };
      }
    }

    // 5. Recarregar já com joins
    const { data: full, error: fetchErr } = await supabase
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

    if (fetchErr || !full) {
      return {
        success: false,
        error: fetchErr?.message || "Falha ao carregar episódio recém-criado.",
        code: fetchErr?.code,
      };
    }

    revalidatePath("/admin/episodes");

    return {
      success: true,
      episode: mapRawToEpisode(full),
    };
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || "Erro inesperado ao criar episódio.",
    };
  }
}

/* =========================================================
 * UPDATE EPISODE (já existia)
 * =======================================================*/
export async function updateEpisodeAction(
  episodeId: string,
  partialUpdates: Partial<UpdateEpisodeServerInput>
): Promise<UpdateEpisodeResult> {
  const supabase = await createSupabaseServerClient();

  const parse = updateEpisodeServerSchema.safeParse(partialUpdates);
  if (!parse.success) {
    return {
      success: false,
      error: parse.error.issues.map((i) => i.message).join("; "),
      code: "INVALID_PAYLOAD",
    };
  }
  const data = parse.data;

  const { tags, ...episodeFieldUpdates } = data;
  const cleaned: Record<string, any> = {};
  Object.entries(episodeFieldUpdates).forEach(([k, v]) => {
    if (v !== undefined) cleaned[k] = v;
  });

  if (Object.keys(cleaned).length > 0) {
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

  if (tags) {
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
    const incomingIds = Array.from(new Set(tags));
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

  revalidatePath("/admin/episodes");
  return { success: true, episode: mapRawToEpisode(updatedRow) };
}

/* =========================================================
 * DELETE EPISODE (já existia)
 * =======================================================*/
export async function deleteEpisodeAction(
  episodeId: string
): Promise<
  { success: true } | { success: false; error: string; code?: string }
> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: ep, error: fetchErr } = await supabase
      .from("episodes")
      .select("id,file_name,episode_documents(id,storage_path)")
      .eq("id", episodeId)
      .single();

    if (fetchErr || !ep) {
      return {
        success: false,
        error: fetchErr?.message || "Episódio não encontrado.",
        code: fetchErr?.code,
      };
    }

    if (ep.episode_documents?.length) {
      const paths = ep.episode_documents.map((d: any) => d.storage_path);
      await supabase.storage.from("episode-documents").remove(paths);
    }

    if (ep.file_name) {
      await supabase.storage.from("episode-audios").remove([ep.file_name]);
    }

    const { error: delErr } = await supabase
      .from("episodes")
      .delete()
      .eq("id", episodeId);

    if (delErr) {
      return {
        success: false,
        error: delErr.message,
        code: delErr.code,
      };
    }

    revalidatePath("/admin/episodes");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || "Erro inesperado." };
  }
}
