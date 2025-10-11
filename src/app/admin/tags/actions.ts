"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/src/lib/supabase-server";

/* =========================
   Schemas
   ========================= */
const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(200).default(25),
  search: z.string().optional().default(""),
  filterMode: z.enum(["all", "used", "unused"]).default("all"),
});

const createTagSchema = z.object({
  name: z.string().min(1).max(255),
  groupId: z.string().optional().nullable(),
});

const updateTagSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(255),
  groupId: z.string().optional().nullable(),
});

const mergeTagsSchema = z.object({
  mainTagId: z.string().min(1),
  otherTagIds: z.array(z.string().min(1)).min(1),
});

const bulkImportSchema = z.object({
  names: z.array(z.string().min(1)).min(1),
});

/* =========================
   Tipos utilitários
   ========================= */
interface ActionError {
  success: false;
  error: string;
  code?: string;
}

interface ListTagsResult {
  success: true;
  data: {
    id: string;
    name: string;
    created_at: string;
    group_id?: string | null;
    episode_count: number;
  }[];
  page: number;
  perPage: number;
  totalFiltered: number; // total considerando search + filterMode
}

interface TagStatsResult {
  success: true;
  total: number;
  unused: number;
}

interface SingleTagResult {
  success: true;
  tag: {
    id: string;
    name: string;
    created_at: string;
    group_id?: string | null;
  };
}

interface BulkImportResult {
  success: true;
  inserted: number;
  skipped: number;
}

interface MergeTagsResult {
  success: true;
  merged: number;
}

/* =========================
   Helpers
   ========================= */
function mapTagRow(row: any) {
  return {
    id: row.id,
    name: row.name,
    created_at: row.created_at,
    group_id: row.group_id,
    episode_count: row.episode_tags?.[0]?.count || 0,
  };
}

/* =========================
   listTagsAction
   ========================= */
export async function listTagsAction(
  params: Partial<z.infer<typeof paginationSchema>>
): Promise<ListTagsResult | ActionError> {
  try {
    const supabase = await createSupabaseServerClient();
    const parsed = paginationSchema.parse(params);
    const { page, perPage, search, filterMode } = parsed;

    // Carrega todas as tags com count (depois filtramos e paginamos)
    let query = supabase.from("tags").select("*, episode_tags(count)");

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data, error } = await query.order("name", { ascending: true });

    if (error) {
      return { success: false, error: error.message, code: error.code };
    }

    const all = (data || []).map(mapTagRow);

    let filtered = all;
    if (filterMode === "used") {
      filtered = all.filter((t) => t.episode_count > 0);
    } else if (filterMode === "unused") {
      filtered = all.filter((t) => t.episode_count === 0);
    }

    const totalFiltered = filtered.length;
    const from = (page - 1) * perPage;
    const to = from + perPage;
    const paginated = filtered.slice(from, to);

    return {
      success: true,
      data: paginated,
      page,
      perPage,
      totalFiltered,
    };
  } catch (e: any) {
    return { success: false, error: e?.message || "Falha ao listar tags." };
  }
}

/* =========================
   getTagGlobalStatsAction
   ========================= */
export async function getTagGlobalStatsAction(): Promise<
  TagStatsResult | ActionError
> {
  try {
    const supabase = await createSupabaseServerClient();

    const { count: total, error: totalErr } = await supabase
      .from("tags")
      .select("*", { count: "exact", head: true });

    if (totalErr) {
      return { success: false, error: totalErr.message, code: totalErr.code };
    }

    const { data: rows, error: allErr } = await supabase
      .from("tags")
      .select("id, episode_tags(count)");

    if (allErr) {
      return { success: false, error: allErr.message, code: allErr.code };
    }

    const unused =
      (rows || []).filter((r) => (r.episode_tags?.[0]?.count || 0) === 0)
        ?.length || 0;

    return {
      success: true,
      total: total || 0,
      unused,
    };
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || "Falha ao calcular estatísticas.",
    };
  }
}

/* =========================
   createTagAction
   ========================= */
export async function createTagAction(
  input: z.infer<typeof createTagSchema>
): Promise<SingleTagResult | ActionError> {
  try {
    const parsed = createTagSchema.parse(input);
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("tags")
      .insert([
        {
          name: parsed.name.trim().toLowerCase(),
          group_id: parsed.groupId || null,
        },
      ])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message, code: error.code };
    }

    revalidatePath("/admin/tags");
    return {
      success: true,
      tag: {
        id: data.id,
        name: data.name,
        created_at: data.created_at,
        group_id: data.group_id,
      },
    };
  } catch (e: any) {
    return { success: false, error: e?.message || "Erro ao criar tag." };
  }
}

/* =========================
   updateTagAction
   ========================= */
export async function updateTagAction(
  input: z.infer<typeof updateTagSchema>
): Promise<SingleTagResult | ActionError> {
  try {
    const parsed = updateTagSchema.parse(input);
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("tags")
      .update({
        name: parsed.name.trim().toLowerCase(),
        group_id: parsed.groupId || null,
      })
      .eq("id", parsed.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message, code: error.code };
    }

    if (!data) {
      return {
        success: false,
        error: "Nenhum dado retornado.",
        code: "NO_DATA",
      };
    }

    revalidatePath("/admin/tags");
    return {
      success: true,
      tag: {
        id: data.id,
        name: data.name,
        created_at: data.created_at,
        group_id: data.group_id,
      },
    };
  } catch (e: any) {
    return { success: false, error: e?.message || "Erro ao atualizar tag." };
  }
}

/* =========================
   deleteTagAction
   ========================= */
export async function deleteTagAction(
  id: string
): Promise<{ success: true } | ActionError> {
  try {
    if (!id) return { success: false, error: "ID ausente." };
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.from("tags").delete().eq("id", id);
    if (error) {
      return { success: false, error: error.message, code: error.code };
    }

    revalidatePath("/admin/tags");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || "Erro ao excluir tag." };
  }
}

/* =========================
   deleteUnusedTagsAction
   ========================= */
export async function deleteUnusedTagsAction(): Promise<
  { success: true; deleted: number } | ActionError
> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("tags")
      .select("id, episode_tags(count)");

    if (error) {
      return { success: false, error: error.message, code: error.code };
    }

    const unusedIds =
      (data || [])
        .filter((r) => (r.episode_tags?.[0]?.count || 0) === 0)
        .map((r) => r.id) || [];

    if (unusedIds.length === 0) {
      return { success: true, deleted: 0 };
    }

    const { error: delErr } = await supabase
      .from("tags")
      .delete()
      .in("id", unusedIds);

    if (delErr) {
      return { success: false, error: delErr.message, code: delErr.code };
    }

    revalidatePath("/admin/tags");
    return { success: true, deleted: unusedIds.length };
  } catch (e: any) {
    return { success: false, error: e?.message || "Erro ao limpar tags." };
  }
}

/* =========================
   mergeTagsAction
   ========================= */
export async function mergeTagsAction(
  input: z.infer<typeof mergeTagsSchema>
): Promise<MergeTagsResult | ActionError> {
  try {
    const parsed = mergeTagsSchema.parse(input);
    const { mainTagId, otherTagIds } = parsed;

    // Remover caso mainTagId esteja erroneamente na lista
    const others = otherTagIds.filter((id) => id !== mainTagId);
    if (others.length === 0) {
      return {
        success: false,
        error: "Lista de tags para mesclar está vazia.",
        code: "NO_OTHERS",
      };
    }

    const supabase = await createSupabaseServerClient();

    // Buscar episódios vinculados às outras tags
    const { data: episodes, error: epErr } = await supabase
      .from("episode_tags")
      .select("episode_id, tag_id")
      .in("tag_id", others);

    if (epErr) {
      return { success: false, error: epErr.message, code: epErr.code };
    }

    const episodeIds = [...new Set((episodes || []).map((e) => e.episode_id))];

    if (episodeIds.length > 0) {
      // Apagar relacionamentos antigos dessas episodes (todas as tags listadas)
      const { error: delRelErr } = await supabase
        .from("episode_tags")
        .delete()
        .in("episode_id", episodeIds);
      if (delRelErr) {
        return {
          success: false,
          error: delRelErr.message,
          code: delRelErr.code,
        };
      }

      // Recriar somente com a tag principal
      const rowsToInsert = episodeIds.map((episodeId) => ({
        episode_id: episodeId,
        tag_id: mainTagId,
      }));
      const { error: insertErr } = await supabase
        .from("episode_tags")
        .insert(rowsToInsert);
      if (insertErr) {
        return {
          success: false,
          error: insertErr.message,
          code: insertErr.code,
        };
      }
    }

    // Apagar as outras tags
    const { error: delTagsErr } = await supabase
      .from("tags")
      .delete()
      .in("id", others);
    if (delTagsErr) {
      return {
        success: false,
        error: delTagsErr.message,
        code: delTagsErr.code,
      };
    }

    revalidatePath("/admin/tags");
    return { success: true, merged: others.length };
  } catch (e: any) {
    return { success: false, error: e?.message || "Erro ao mesclar tags." };
  }
}

/* =========================
   bulkImportTagsAction
   ========================= */
export async function bulkImportTagsAction(
  input: z.infer<typeof bulkImportSchema>
): Promise<BulkImportResult | ActionError> {
  try {
    const parsed = bulkImportSchema.parse(input);
    // Normalizar
    const normalized = parsed.names
      .map((n) => n.trim().toLowerCase())
      .filter(Boolean);
    const unique = [...new Set(normalized)];

    const supabase = await createSupabaseServerClient();
    // Buscar existência
    const { data: existing, error: existErr } = await supabase
      .from("tags")
      .select("name")
      .in("name", unique);

    if (existErr) {
      return { success: false, error: existErr.message, code: existErr.code };
    }

    const existingSet = new Set((existing || []).map((r) => r.name));
    const toInsert = unique
      .filter((n) => !existingSet.has(n))
      .map((n) => ({ name: n }));

    if (toInsert.length > 0) {
      const { error: insErr } = await supabase.from("tags").insert(toInsert);
      if (insErr) {
        return { success: false, error: insErr.message, code: insErr.code };
      }
    }

    revalidatePath("/admin/tags");
    return {
      success: true,
      inserted: toInsert.length,
      skipped: unique.length - toInsert.length,
    };
  } catch (e: any) {
    return { success: false, error: e?.message || "Erro na importação." };
  }
}

/* =========================
   listTagGroupsAction
   ========================= */
export async function listTagGroupsAction(): Promise<
  { success: true; data: { id: string; name: string }[] } | ActionError
> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("tag_groups")
      .select("id, name")
      .order("name");
    if (error) {
      return { success: false, error: error.message, code: error.code };
    }
    return { success: true, data: data || [] };
  } catch (e: any) {
    return { success: false, error: e?.message || "Erro ao listar grupos." };
  }
}

/* =========================
   listAllTagNamesAction (export)
   ========================= */
export async function listAllTagNamesAction(): Promise<
  { success: true; data: { name: string }[] } | ActionError
> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("tags")
      .select("name")
      .order("name");
    if (error) {
      return { success: false, error: error.message, code: error.code };
    }
    return { success: true, data: data || [] };
  } catch (e: any) {
    return { success: false, error: e?.message || "Erro ao listar nomes." };
  }
}

export async function getPaginatedTagAliases(page: number, pageSize: number) {
  "use server";
  const supabase = await createSupabaseServerClient();

  const start = (page - 1) * pageSize;
  const end = page * pageSize - 1;

  const { data: aliases, error } = await supabase
    .from("tag_aliases")
    .select("*, tags!inner(name)")
    .range(start, end)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching paginated tag aliases:", error);
    return { aliases: [], count: 0 };
  }

  const { count, error: countError } = await supabase
    .from("tag_aliases")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("Error fetching tag aliases count:", countError);
    return { aliases, count: 0 };
  }

  return { aliases, count: count ?? 0 };
}
export async function getPaginatedTagGroups(page: number, pageSize: number) {
  "use server";
  const supabase = await createSupabaseServerClient();

  const start = (page - 1) * pageSize;
  const end = page * pageSize - 1;

  const { data: groups, error } = await supabase
    .from("tag_groups")
    .select("*, tags(*)") // Inclui as tags de cada grupo
    .range(start, end)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching paginated tag groups:", error);
    return { groups: [], count: 0 };
  }

  const { count, error: countError } = await supabase
    .from("tag_groups")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("Error fetching tag groups count:", countError);
    return { groups, count: 0 };
  }

  return { groups, count: count ?? 0 };
}
