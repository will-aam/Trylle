"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/src/lib/supabase-server";
import { Category, Subcategory } from "@/src/lib/types";

/* =========================
   Schemas de validação
   ========================= */
const baseIdSchema = z.string().min(1, "ID inválido");

const createCategorySchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(120),
  // Novo campo: tema de cor (classe CSS), pode ser string ou null
  color_theme: z.string().nullable().optional(),
});

const updateCategorySchema = z.object({
  id: baseIdSchema,
  name: z.string().min(1).max(120),
  // Novo campo: tema de cor (classe CSS), pode ser string ou null
  color_theme: z.string().nullable().optional(),
});

const createSubcategorySchema = z.object({
  categoryId: baseIdSchema,
  name: z.string().min(1).max(120),
});

const updateSubcategorySchema = z.object({
  id: baseIdSchema,
  name: z.string().min(1).max(120),
});

const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(100).default(10),
  search: z.string().optional().default(""),
  sortType: z.enum(["name", "episodes"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

/* =========================
   Tipos utilitários
   ========================= */
interface ActionError {
  success: false;
  error: string;
  code?: string;
}

interface ListCategoriesResult {
  success: true;
  data: (Category & { episode_count: number })[];
  count: number;
  page: number;
  perPage: number;
}

interface ListSubcategoriesResult {
  success: true;
  data: (Subcategory & { episode_count: number })[];
}

interface SingleCategoryResult {
  success: true;
  category: Category;
}

interface SingleSubcategoryResult {
  success: true;
  subcategory: Subcategory;
}

/* =========================
   Helpers (sem updated_at)
   ========================= */
function mapCategoryRow(row: any): Category & { episode_count: number } {
  // Incluímos color_theme no objeto retornado.
  // Mantemos a assinatura de tipo e fazemos cast para evitar quebrar o tipo Category atual caso não tenha color_theme ainda.
  return {
    id: row.id,
    name: row.name,
    color_theme: row.color_theme ?? null,
    created_at: row.created_at,
    episode_count: row.episodes?.[0]?.count || 0,
  } as any;
}

function mapSubcategoryRow(row: any): Subcategory & { episode_count: number } {
  return {
    id: row.id,
    name: row.name,
    category_id: row.category_id,
    created_at: row.created_at,
    episode_count: row.episodes?.[0]?.count || 0,
  };
}

/* =========================
   Listagens
   ========================= */
export async function listCategoriesAction(
  params: Partial<z.infer<typeof paginationSchema>>
): Promise<ListCategoriesResult | ActionError> {
  try {
    const supabase = await createSupabaseServerClient();
    const parsed = paginationSchema.parse(params);

    const { page, perPage, search, sortOrder, sortType } = parsed;
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = supabase
      .from("categories")
      .select("*, episodes(count)", { count: "exact" });

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    if (sortType === "name") {
      query = query.order("name", { ascending: sortOrder === "asc" });
    } else {
      // ordena por nome no backend, reordena por episodes no client depois
      query = query.order("name", { ascending: true });
    }

    const { data, count, error } = await query.range(from, to);
    if (error)
      return { success: false, error: error.message, code: error.code };

    let mapped = (data || []).map(mapCategoryRow);

    if (sortType === "episodes") {
      mapped = mapped.sort((a, b) =>
        sortOrder === "asc"
          ? a.episode_count - b.episode_count
          : b.episode_count - a.episode_count
      );
    }

    return {
      success: true,
      data: mapped,
      count: count || 0,
      page,
      perPage,
    };
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || "Falha ao listar categorias.",
    };
  }
}

export async function listAllCategoriesAction(): Promise<
  { success: true; data: Category[] } | ActionError
> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });
    if (error)
      return { success: false, error: error.message, code: error.code };
    return { success: true, data: data || [] };
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || "Erro ao carregar categorias.",
    };
  }
}

export async function listSubcategoriesByCategoryAction(
  categoryId: string
): Promise<ListSubcategoriesResult | ActionError> {
  try {
    if (!categoryId) return { success: false, error: "categoryId ausente." };
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("subcategories")
      .select("*, episodes(count)")
      .eq("category_id", categoryId)
      .order("name", { ascending: true });

    if (error)
      return { success: false, error: error.message, code: error.code };

    return {
      success: true,
      data: (data || []).map(mapSubcategoryRow),
    };
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || "Falha ao listar subcategorias.",
    };
  }
}

/* =========================
   Mutação - Categoria
   ========================= */
export async function createCategoryAction(
  input: z.infer<typeof createCategorySchema>
): Promise<SingleCategoryResult | ActionError> {
  try {
    const parsed = createCategorySchema.parse(input);
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("categories")
      .insert([
        {
          name: parsed.name.trim(),
          color_theme: parsed.color_theme ?? null,
        },
      ])
      .select()
      .single();

    if (error)
      return { success: false, error: error.message, code: error.code };

    revalidatePath("/admin/categories");
    return { success: true, category: data as Category };
  } catch (e: any) {
    return { success: false, error: e?.message || "Erro ao criar categoria." };
  }
}

export async function updateCategoryAction(
  input: z.infer<typeof updateCategorySchema>
): Promise<SingleCategoryResult | ActionError> {
  try {
    const parsed = updateCategorySchema.parse(input);
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("categories")
      .update({
        name: parsed.name.trim(),
        color_theme: parsed.color_theme ?? null,
      })
      .eq("id", parsed.id)
      .select()
      .single();

    if (error)
      return { success: false, error: error.message, code: error.code };
    if (!data)
      return {
        success: false,
        error: "Nenhum dado retornado.",
        code: "NO_DATA",
      };

    revalidatePath("/admin/categories");
    return { success: true, category: data as Category };
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || "Erro ao atualizar categoria.",
    };
  }
}

export async function deleteCategoryAction(
  categoryId: string
): Promise<{ success: true } | ActionError> {
  try {
    if (!categoryId) return { success: false, error: "categoryId ausente." };
    const supabase = await createSupabaseServerClient();

    const { error: subErr } = await supabase
      .from("subcategories")
      .delete()
      .eq("category_id", categoryId);
    if (subErr)
      return { success: false, error: subErr.message, code: subErr.code };

    const { error: catErr } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);
    if (catErr)
      return { success: false, error: catErr.message, code: catErr.code };

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || "Erro ao excluir categoria.",
    };
  }
}

/* =========================
   Mutação - Subcategoria
   ========================= */
export async function createSubcategoryAction(
  input: z.infer<typeof createSubcategorySchema>
): Promise<SingleSubcategoryResult | ActionError> {
  try {
    const parsed = createSubcategorySchema.parse(input);
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("subcategories")
      .insert([{ name: parsed.name.trim(), category_id: parsed.categoryId }])
      .select("*, episodes(count)")
      .single();

    if (error)
      return { success: false, error: error.message, code: error.code };

    const mapped = mapSubcategoryRow(data);
    revalidatePath("/admin/categories");
    return { success: true, subcategory: mapped };
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || "Erro ao criar subcategoria.",
    };
  }
}

export async function updateSubcategoryAction(
  input: z.infer<typeof updateSubcategorySchema>
): Promise<SingleSubcategoryResult | ActionError> {
  try {
    const parsed = updateSubcategorySchema.parse(input);
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("subcategories")
      .update({
        name: parsed.name.trim(),
      })
      .eq("id", parsed.id)
      .select("*, episodes(count)")
      .single();

    if (error)
      return { success: false, error: error.message, code: error.code };
    if (!data)
      return {
        success: false,
        error: "Nenhum dado retornado.",
        code: "NO_DATA",
      };

    const mapped = mapSubcategoryRow(data);
    revalidatePath("/admin/categories");
    return { success: true, subcategory: mapped };
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || "Erro ao atualizar subcategoria.",
    };
  }
}

export async function deleteSubcategoryAction(
  subcategoryId: string
): Promise<{ success: true } | ActionError> {
  try {
    if (!subcategoryId)
      return { success: false, error: "subcategoryId ausente." };
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from("subcategories")
      .delete()
      .eq("id", subcategoryId);

    if (error)
      return { success: false, error: error.message, code: error.code };

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || "Erro ao excluir subcategoria.",
    };
  }
}
export async function getAllCategoriesAndSubcategories() {
  "use server";
  const supabase = await createSupabaseServerClient();
  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (catError) {
    console.error("Error fetching categories:", catError);
    return { categories: [], subcategories: [] };
  }

  const { data: subcategories, error: subError } = await supabase
    .from("subcategories")
    .select("*")
    .order("name", { ascending: true });

  if (subError) {
    console.error("Error fetching subcategories:", subError);
    return { categories, subcategories: [] };
  }

  return { categories, subcategories };
}
