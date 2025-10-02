// src/services/categoryService.ts

// 1. AQUI ESTÁ A MUDANÇA: Importe a nova função
import { createSupabaseBrowserClient } from "@/src/lib/supabase-client";
import { Category, Subcategory } from "@/src/lib/types";
import { CategoryFormData } from "../lib/schemas";

// 2. E AQUI: Use a nova função para criar o cliente
const supabase = createSupabaseBrowserClient();

type FetchCategoriesParams = {
  currentPage: number;
  itemsPerPage: number;
  debouncedSearchTerm: string;
  sortType: "name" | "episodes";
  sortOrder: "asc" | "desc";
};

// ========================================================================
// === ADIÇÃO: NOVA FUNÇÃO SIMPLES PARA BUSCAR TODAS AS CATEGORIAS ===
// ========================================================================
/**
 * Busca todas as categorias para preencher menus de seleção.
 */
export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Erro ao buscar a lista de categorias:", error);
    throw new Error("Não foi possível carregar as categorias.");
  }

  return data || [];
};
// ========================================================================
// === FIM DA ADIÇÃO ===
// ========================================================================

export const categoryService = {
  async fetchCategories({
    currentPage,
    itemsPerPage,
    debouncedSearchTerm,
    sortType,
    sortOrder,
  }: FetchCategoriesParams): Promise<{ data: Category[]; count: number }> {
    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    let query = supabase
      .from("categories")
      .select("*, episodes(count)", { count: "exact" });

    if (debouncedSearchTerm) {
      query = query.ilike("name", `%${debouncedSearchTerm}%`);
    }

    if (sortType === "name") {
      query = query.order("name", { ascending: sortOrder === "asc" });
    } else {
      query = query.order("name", { ascending: sortOrder === "asc" }); // Fallback sort
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Não foi possível carregar as categorias.");
    }

    const categoriesWithCount = (data || []).map((c: any) => ({
      ...c,
      episode_count: c.episodes[0]?.count || 0,
    }));

    return { data: categoriesWithCount, count: count || 0 };
  },

  async addCategory(categoryData: CategoryFormData): Promise<Category> {
    const { data, error } = await supabase
      .from("categories")
      .insert([
        {
          name: categoryData.name.trim(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding category:", error);
      throw new Error("Erro ao criar categoria.");
    }
    return data;
  },

  async deleteCategory(categoryId: string): Promise<void> {
    const { error: subError } = await supabase
      .from("subcategories")
      .delete()
      .eq("category_id", categoryId);

    if (subError) {
      console.error("Error deleting subcategories:", subError);
      throw new Error("Erro ao excluir subcategorias.");
    }

    const { error: catError } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);

    if (catError) {
      console.error("Error deleting category:", catError);
      throw new Error("Erro ao excluir categoria.");
    }
  },

  async fetchSubcategories(categoryId: string): Promise<Subcategory[]> {
    const { data, error } = await supabase
      .from("subcategories")
      .select("*, episodes(count)") // Adjusted for potential empty results
      .eq("category_id", categoryId);

    if (error) {
      console.error("Error fetching subcategories:", error);
      throw new Error("Não foi possível carregar as subcategorias.");
    }
    return (data || []).map((s: any) => ({
      ...s,
      episode_count: s.episodes[0]?.count || 0,
    }));
  },

  async addSubcategory(name: string, categoryId: string): Promise<Subcategory> {
    const { data, error } = await supabase
      .from("subcategories")
      .insert([{ name: name.trim(), category_id: categoryId }])
      .select("*, episodes(count)") // Adjusted for potential empty results
      .single();

    if (error) {
      console.error("Error adding subcategory:", error);
      throw new Error("Erro ao criar subcategoria.");
    }
    return { ...data, episode_count: data.episodes[0]?.count || 0 };
  },

  async updateSubcategory(
    subcategoryId: string,
    newName: string
  ): Promise<Subcategory> {
    const { data, error } = await supabase
      .from("subcategories")
      .update({ name: newName })
      .eq("id", subcategoryId)
      .select("*, episodes(count)") // Adjusted for potential empty results
      .single();

    if (error) {
      console.error("Error updating subcategory:", error);
      throw new Error("Erro ao atualizar subcategoria.");
    }
    return { ...data, episode_count: data.episodes[0]?.count || 0 };
  },

  async deleteSubcategory(subcategoryId: string): Promise<void> {
    const { error } = await supabase
      .from("subcategories")
      .delete()
      .eq("id", subcategoryId);

    if (error) {
      console.error("Error deleting subcategory:", error);
      throw new Error("Verifique se não há episódios associados a ela.");
    }
  },

  async updateCategory(
    categoryId: string,
    categoryData: CategoryFormData
  ): Promise<Category> {
    const { data, error } = await supabase
      .from("categories")
      .update({
        name: categoryData.name.trim(),
      })
      .eq("id", categoryId)
      .select()
      .single();

    if (error) {
      console.error("Error updating category:", error);
      throw new Error("Erro ao atualizar categoria.");
    }
    return data;
  },
};
