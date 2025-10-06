"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/src/lib/supabase-server";
import { Episode, Tag, EpisodeDocument } from "@/src/lib/types";

const createEpisodeSchema = z.object({
  title: z.string().min(1, "Título obrigatório."),
  description: z.string().nullable().optional(),
  audio_url: z.string().url("URL de áudio inválida."),
  file_name: z.string().min(1),
  program_id: z.string().nullable().optional(),
  episode_number: z.number().int().positive().nullable().optional(),
  category_id: z.string().nullable().optional(),
  subcategory_id: z.string().nullable().optional(),
  published_at: z.string().datetime(), // ISO
  status: z.enum(["draft", "scheduled", "published"]),
  duration_in_seconds: z.number().int().positive().nullable().optional(),
  tagIds: z.array(z.string()).optional().default([]),
});

export type CreateEpisodeInput = z.infer<typeof createEpisodeSchema>;

export type CreateEpisodeResult =
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

  const documents: EpisodeDocument[] | null =
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
    episode_documents: documents,
  };
}

export async function createEpisodeAction(
  input: CreateEpisodeInput
): Promise<CreateEpisodeResult> {
  const supabase = await createSupabaseServerClient();
  const parsed = createEpisodeSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map((e) => e.message).join("; "),
      code: "INVALID_PAYLOAD",
    };
  }

  const {
    tagIds,
    title,
    description,
    audio_url,
    file_name,
    program_id,
    episode_number,
    category_id,
    subcategory_id,
    published_at,
    status,
    duration_in_seconds,
  } = parsed.data;

  // 1. Inserir episódio
  const { data: insertedRow, error: insertError } = await supabase
    .from("episodes")
    .insert([
      {
        title: title.trim(),
        description: description?.trim() || null,
        audio_url,
        file_name,
        program_id: program_id || null,
        episode_number: episode_number ?? null,
        category_id: category_id || null,
        subcategory_id: subcategory_id || null,
        published_at,
        status,
        duration_in_seconds: duration_in_seconds ?? null,
      },
    ])
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

  if (insertError || !insertedRow) {
    return {
      success: false,
      error: insertError?.message || "Falha ao criar episódio.",
      code: insertError?.code,
    };
  }

  // 2. Inserir pivot de tags (se houver)
  if (tagIds && tagIds.length > 0) {
    const pivotPayload = tagIds.map((tagId) => ({
      episode_id: insertedRow.id,
      tag_id: tagId,
    }));
    const { error: pivotError } = await supabase
      .from("episode_tags")
      .insert(pivotPayload);
    if (pivotError) {
      return {
        success: false,
        error: pivotError.message,
        code: pivotError.code,
      };
    }
  }

  // 3. Buscar novamente com joins para retorno consistente
  const { data: fullRow, error: fetchError } = await supabase
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
    .eq("id", insertedRow.id)
    .single<RawEpisodeRow>();

  if (fetchError || !fullRow) {
    return {
      success: false,
      error: fetchError?.message || "Falha ao carregar episódio recém-criado.",
      code: fetchError?.code,
    };
  }

  // 4. Revalidar listagem
  revalidatePath("/admin/episodes");

  // 5. Mapear retorno
  return {
    success: true,
    episode: mapRawToEpisode(fullRow),
  };
}
