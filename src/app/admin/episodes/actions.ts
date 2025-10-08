"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/src/lib/supabase-server";
import { Episode, Tag, EpisodeDocument, Program } from "@/src/lib/types";

/* =========================================================
 * SCHEMAS: CREATE / UPDATE
 * =======================================================*/
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

/* =========================================================
 * SCHEMA: LIST / FILTER
 * =======================================================*/
const listEpisodesSchema = z.object({
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(100).default(10),
  search: z.string().optional().default(""),
  status: z
    .array(z.enum(["draft", "scheduled", "published"]))
    .optional()
    .default([]),
  categoryIds: z.array(z.string()).optional().default([]),
  programIds: z.array(z.string()).optional().default([]),
  sortBy: z
    .enum([
      "published_at",
      "created_at",
      "title",
      "episode_number",
      "view_count",
      "status",
    ])
    .default("published_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
  includeTags: z.boolean().optional().default(false),
  includeDocuments: z.boolean().optional().default(false),
});

/* =========================================================
 * AUXILIARY TYPES
 * =======================================================*/
interface ActionError {
  success: false;
  error: string;
  code?: string;
}
interface ListEpisodesResult {
  success: true;
  data: Episode[];
  page: number;
  perPage: number;
  totalFiltered: number;
}
interface StatusCountsResult {
  success: true;
  counts: { draft: number; scheduled: number; published: number };
}
interface EpisodeTotalsResult {
  success: true;
  totalFiltered: number;
  totalAll: number;
}
interface NextEpisodeNumberResult {
  success: true;
  nextNumber: number;
}
interface SingleEpisodeResult {
  success: true;
  episode: Episode;
}

/* =========================================================
 * RAW ROW TYPE (flexível para variações do Supabase)
 * =======================================================*/
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
  /**
   * Pode vir:
   * [{ tag: { ... } }] OU [{ tag: [{...},{...}] }]
   */
  episode_tags?: {
    tag:
      | {
          id: string;
          name: string;
          created_at: string;
        }
      | {
          id: string;
          name: string;
          created_at: string;
        }[]
      | null;
  }[];
  programs?: {
    id: string;
    title: string;
    description: string | null;
    category_id: string | null;
    created_at: string;
    updated_at: string;
  } | null;
  categories?: { name: string | null } | null;
  subcategories?: { name: string | null } | null;
}

/* =========================================================
 * MAP RAW → DOMAIN
 * =======================================================*/
function mapRawToEpisode(row: RawEpisodeRow): Episode {
  const collectedTags: Tag[] = [];

  if (row.episode_tags && Array.isArray(row.episode_tags)) {
    for (const et of row.episode_tags) {
      const raw = et?.tag;
      if (!raw) continue;
      if (Array.isArray(raw)) {
        for (const t of raw) {
          if (t && t.id) {
            collectedTags.push({
              id: t.id,
              name: t.name,
              created_at: t.created_at,
            });
          }
        }
      } else if (raw.id) {
        collectedTags.push({
          id: raw.id,
          name: raw.name,
          created_at: raw.created_at,
        });
      }
    }
  }

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

  let programValue: Program | undefined;
  if (row.programs) {
    programValue = {
      id: row.programs.id,
      title: row.programs.title,
      description: row.programs.description ?? "",
      category_id: row.programs.category_id ?? "",
      created_at: row.programs.created_at,
      updated_at: row.programs.updated_at,
      category: null, // placeholder
    } as Program;
  }

  const categoriesRel =
    row.categories && typeof row.categories.name === "string"
      ? { name: row.categories.name }
      : null;
  const subcategoriesRel =
    row.subcategories && typeof row.subcategories.name === "string"
      ? { name: row.subcategories.name }
      : null;

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
    program_id: row.program_id,
    episode_number: row.episode_number,
    tags: collectedTags,
    programs: programValue || null,
    categories: categoriesRel,
    subcategories: subcategoriesRel,
    episode_documents: episodeDocuments,
  };
}

/* =========================================================
 * CREATE
 * =======================================================*/
export async function createEpisodeAction(
  payload: CreateEpisodeInput
): Promise<CreateEpisodeResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const parsed = createEpisodeSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join("; "),
        code: "INVALID_PAYLOAD",
      };
    }
    const data = parsed.data;

    const now = new Date();
    let publishedAtISO = data.published_at;
    const providedDate = new Date(data.published_at);

    if (data.status === "published" && providedDate > now) {
      publishedAtISO = now.toISOString();
    }
    if (data.status === "scheduled" && providedDate <= now) {
      return {
        success: false,
        error: "Data futura obrigatória para status 'scheduled'.",
        code: "INVALID_SCHEDULE_DATE",
      };
    }

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
      .single();

    if (insertErr || !inserted) {
      return {
        success: false,
        error: insertErr?.message || "Falha ao inserir episódio.",
        code: insertErr?.code,
      };
    }

    const episodeId = inserted.id;

    if (data.tagIds.length > 0) {
      const pivotRows = data.tagIds.map((tagId) => ({
        episode_id: episodeId,
        tag_id: tagId,
      }));
      const { error: pivotErr } = await supabase
        .from("episode_tags")
        .insert(pivotRows);
      if (pivotErr) {
        return {
          success: false,
          error:
            "Episódio criado, mas falha ao vincular tags: " + pivotErr.message,
          code: pivotErr.code,
        };
      }
    }

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
        programs (
          id,
          title,
          description,
          category_id,
          created_at,
          updated_at
        ),
        categories ( name ),
        subcategories ( name ),
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
      .single();

    if (fetchErr || !full) {
      return {
        success: false,
        error: fetchErr?.message || "Falha ao carregar episódio recém-criado.",
        code: fetchErr?.code,
      };
    }

    const fullRow = full as unknown as RawEpisodeRow;
    revalidatePath("/admin/episodes");
    return { success: true, episode: mapRawToEpisode(fullRow) };
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || "Erro inesperado ao criar episódio.",
    };
  }
}

/* =========================================================
 * UPDATE
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
      programs (
        id,
        title,
        description,
        category_id,
        created_at,
        updated_at
      ),
      categories ( name ),
      subcategories ( name ),
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
    .single();

  if (fetchError || !updatedRow) {
    return {
      success: false,
      error: fetchError?.message || "Falha ao carregar episódio atualizado.",
      code: fetchError?.code,
    };
  }

  const updatedNorm = updatedRow as unknown as RawEpisodeRow;
  revalidatePath("/admin/episodes");
  return { success: true, episode: mapRawToEpisode(updatedNorm) };
}

/* =========================================================
 * DELETE
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

/* =========================================================
 * LIST
 * =======================================================*/
export async function listEpisodesAction(
  params: Partial<z.infer<typeof listEpisodesSchema>>
): Promise<ListEpisodesResult | ActionError> {
  try {
    const supabase = await createSupabaseServerClient();
    const parsed = listEpisodesSchema.parse(params);
    const {
      page,
      perPage,
      search,
      status,
      categoryIds,
      programIds,
      sortBy,
      order,
      includeTags,
      includeDocuments,
    } = parsed;

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const baseSelect: string[] = [
      "id",
      "title",
      "description",
      "audio_url",
      "file_name",
      "category_id",
      "subcategory_id",
      "status",
      "published_at",
      "created_at",
      "updated_at",
      "duration_in_seconds",
      "view_count",
      "program_id",
      "episode_number",
      "programs(id,title,description,category_id,created_at,updated_at)",
      "categories(name)",
      "subcategories(name)",
    ];

    if (includeDocuments) {
      baseSelect.push(
        "episode_documents(id,episode_id,file_name,public_url,storage_path,created_at,file_size,page_count,reference_count)"
      );
    }
    if (includeTags) {
      baseSelect.push(
        "episode_tags:episode_tags(tag:tags(id,name,created_at))"
      );
    }

    let query = supabase
      .from("episodes")
      .select(baseSelect.join(","), { count: "exact" })
      .order(sortBy, { ascending: order === "asc" })
      .range(from, to);

    if (search) query = query.ilike("title", `%${search}%`);
    if (status.length > 0) query = query.in("status", status);
    if (categoryIds.length > 0) query = query.in("category_id", categoryIds);
    if (programIds.length > 0) query = query.in("program_id", programIds);

    const { data, error, count } = await query;
    if (error) {
      return { success: false, error: error.message, code: error.code };
    }

    const mapped = (data || []).map((r) =>
      mapRawToEpisode(r as unknown as RawEpisodeRow)
    );

    return {
      success: true,
      data: mapped,
      page,
      perPage,
      totalFiltered: count || 0,
    };
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || "Falha ao listar episódios.",
    };
  }
}

/* =========================================================
 * STATUS COUNTS
 * =======================================================*/
export async function getEpisodeStatusCountsAction(): Promise<
  StatusCountsResult | ActionError
> {
  try {
    const supabase = await createSupabaseServerClient();
    const statuses: Array<"draft" | "scheduled" | "published"> = [
      "draft",
      "scheduled",
      "published",
    ];
    const counts: Record<string, number> = {
      draft: 0,
      scheduled: 0,
      published: 0,
    };

    const results = await Promise.all(
      statuses.map((s) =>
        supabase
          .from("episodes")
          .select("*", { count: "exact", head: true })
          .eq("status", s)
      )
    );

    results.forEach((r, idx) => {
      if (!r.error) counts[statuses[idx]] = r.count || 0;
    });

    return {
      success: true,
      counts: {
        draft: counts.draft,
        scheduled: counts.scheduled,
        published: counts.published,
      },
    };
  } catch (e: any) {
    return { success: false, error: e?.message || "Falha ao contar status." };
  }
}

/* =========================================================
 * TOTALS
 * =======================================================*/
export async function getEpisodeTotalsAction(
  params: Partial<
    Pick<
      z.infer<typeof listEpisodesSchema>,
      "search" | "status" | "categoryIds" | "programIds"
    >
  >
): Promise<EpisodeTotalsResult | ActionError> {
  try {
    const supabase = await createSupabaseServerClient();

    const { count: totalAll, error: allErr } = await supabase
      .from("episodes")
      .select("*", { count: "exact", head: true });
    if (allErr) {
      return { success: false, error: allErr.message, code: allErr.code };
    }

    const {
      search = "",
      status = [],
      categoryIds = [],
      programIds = [],
    } = params;

    let filteredQuery = supabase
      .from("episodes")
      .select("*", { count: "exact", head: true });

    if (search) filteredQuery = filteredQuery.ilike("title", `%${search}%`);
    if (status.length > 0) filteredQuery = filteredQuery.in("status", status);
    if (categoryIds.length > 0)
      filteredQuery = filteredQuery.in("category_id", categoryIds);
    if (programIds.length > 0)
      filteredQuery = filteredQuery.in("program_id", programIds);

    const { count: totalFiltered, error: filtErr } = await filteredQuery;
    if (filtErr) {
      return { success: false, error: filtErr.message, code: filtErr.code };
    }

    return {
      success: true,
      totalFiltered: totalFiltered || 0,
      totalAll: totalAll || 0,
    };
  } catch (e: any) {
    return { success: false, error: e?.message || "Falha ao calcular totais." };
  }
}

/* =========================================================
 * NEXT EPISODE NUMBER
 * =======================================================*/
export async function getNextEpisodeNumberAction(
  programId: string
): Promise<NextEpisodeNumberResult | ActionError> {
  try {
    if (!programId) {
      return { success: true, nextNumber: 1 };
    }
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("episodes")
      .select("episode_number")
      .eq("program_id", programId)
      .order("episode_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message, code: error.code };
    }
    const last = data?.episode_number || 0;
    return { success: true, nextNumber: last + 1 };
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || "Falha ao obter próximo número.",
    };
  }
}

/* =========================================================
 * GET BY ID
 * =======================================================*/
export async function getEpisodeByIdAction(
  id: string
): Promise<SingleEpisodeResult | ActionError> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
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
        programs (
          id,
          title,
          description,
          category_id,
          created_at,
          updated_at
        ),
        categories ( name ),
        subcategories ( name ),
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
          tag:tags ( id, name, created_at )
        )
        `
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      return {
        success: false,
        error: error?.message || "Episódio não encontrado.",
        code: error?.code,
      };
    }
    const singleNorm = data as unknown as RawEpisodeRow;
    return { success: true, episode: mapRawToEpisode(singleNorm) };
  } catch (e: any) {
    return { success: false, error: e?.message || "Falha ao buscar episódio." };
  }
}
