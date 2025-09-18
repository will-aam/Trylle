"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createClient } from "@/src/lib/supabase-client";
import { Category, Subcategory } from "@/src/lib/types";
import { useToast } from "@/src/hooks/use-toast";

export function useCategoryManager() {
  const supabase = createClient();
  const { toast } = useToast();
  const isInitialMount = useRef(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubcategoryNames, setNewSubcategoryNames] = useState<{
    [key: string]: string;
  }>({});
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] =
    useState(categorySearchTerm);
  const [open, setOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortType, setSortType] = useState<"name" | "episodes">("name");
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<Subcategory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    let query = supabase
      .from("categories")
      .select("*, episodes(count)", { count: "exact" });

    if (debouncedSearchTerm) {
      query = query.ilike("name", `%${debouncedSearchTerm}%`);
    }

    // A CORREÇÃO ESTÁ AQUI:
    // Voltamos a usar a opção `foreignTable` que é a forma mais robusta
    // de ordenar por uma contagem de uma tabela relacionada.
    if (sortType === "name") {
      query = query.order("name", { ascending: sortOrder === "asc" });
    } else {
      query = query.order("count", {
        foreignTable: "episodes",
        ascending: sortOrder === "asc",
      });
    }

    const {
      data: catData,
      error: catError,
      count: catCount,
    } = await query.range(from, to);

    if (catError) {
      console.error("Error fetching data:", catError);
      toast({
        title: "Erro ao buscar dados",
        description:
          catError.message || "Não foi possível carregar a taxonomia.",
        variant: "destructive",
      });
    } else {
      const categoriesWithCount = (catData || []).map((c) => ({
        ...c,
        episode_count: c.episodes[0]?.count || 0,
      }));
      setCategories(categoriesWithCount);
      setTotalCount(catCount || 0);
    }
    setLoading(false);
  }, [
    supabase,
    toast,
    currentPage,
    itemsPerPage,
    debouncedSearchTerm,
    sortType,
    sortOrder,
  ]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(categorySearchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [categorySearchTerm]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData, currentPage]);

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      if (sortType === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        const countA = a.episode_count || 0;
        const countB = b.episode_count || 0;
        return sortOrder === "asc" ? countA - countB : countB - countA;
      }
    });
  }, [categories, sortType, sortOrder]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    const { data, error } = await supabase
      .from("categories")
      .insert([{ name: newCategoryName.trim() }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro ao criar categoria",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setCategories(
        [...categories, data].sort((a, b) => a.name.localeCompare(b.name))
      );
      setNewCategoryName("");
      toast({ title: "Sucesso!", description: "Categoria criada." });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const { error: subError } = await supabase
      .from("subcategories")
      .delete()
      .eq("category_id", categoryId);
    if (subError) {
      toast({
        title: "Erro ao excluir subcategorias",
        description: subError.message,
        variant: "destructive",
      });
      return;
    }
    const { error: catError } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);
    if (catError) {
      toast({
        title: "Erro ao excluir categoria",
        description: catError.message,
        variant: "destructive",
      });
    } else {
      fetchData();
      toast({
        title: "Sucesso!",
        description: "Categoria e suas subcategorias foram excluídas.",
      });
    }
  };

  const handleAccordionChange = async (categoryId: string) => {
    if (!categoryId) return;

    const categoryIndex = categories.findIndex((c) => c.id === categoryId);
    if (categoryIndex === -1) return;

    const category = categories[categoryIndex];

    if (!category.subcategories) {
      const updatedCategories = [...categories];
      updatedCategories[categoryIndex] = {
        ...updatedCategories[categoryIndex],
        subcategoriesLoading: true,
      };
      setCategories(updatedCategories);

      const { data: subData, error: subError } = await supabase
        .from("subcategories")
        .select("*, episodes!inner(count)")
        .eq("category_id", categoryId);

      if (subError) {
        toast({
          title: "Erro ao carregar subcategorias",
          description: subError.message,
          variant: "destructive",
        });
        const errorCategories = [...categories];
        errorCategories[categoryIndex] = {
          ...errorCategories[categoryIndex],
          subcategoriesLoading: false,
        };
        setCategories(errorCategories);
      } else {
        const subcategoriesWithCount = (subData || []).map((s) => ({
          ...s,
          episode_count: s.episodes[0].count,
        }));

        setCategories((prevCategories) => {
          const newCategories = [...prevCategories];
          const catIndex = newCategories.findIndex((c) => c.id === categoryId);
          if (catIndex !== -1) {
            newCategories[catIndex] = {
              ...newCategories[catIndex],
              subcategories: subcategoriesWithCount,
              subcategoriesLoading: false,
            };
          }
          return newCategories;
        });
      }
    }
  };

  const handleAddSubcategory = async (categoryId: string) => {
    const subcategoryName = newSubcategoryNames[categoryId];
    if (!subcategoryName || !subcategoryName.trim()) return;
    const { data, error } = await supabase
      .from("subcategories")
      .insert([{ name: subcategoryName.trim(), category_id: categoryId }])
      .select("*, episodes!inner(count)")
      .single();

    if (error) {
      toast({
        title: "Erro ao criar subcategoria",
        description: error.message,
        variant: "destructive",
      });
    } else {
      const newSubcategory = { ...data, episode_count: data.episodes[0].count };
      setCategories((prevCategories) =>
        prevCategories.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                subcategories: c.subcategories
                  ? [...c.subcategories, newSubcategory].sort((a, b) =>
                      a.name.localeCompare(b.name)
                    )
                  : [newSubcategory],
              }
            : c
        )
      );
      setNewSubcategoryNames({ ...newSubcategoryNames, [categoryId]: "" });
      toast({ title: "Sucesso!", description: "Subcategoria criada." });
    }
  };

  const handleUpdateSubcategory = async (
    subcategoryId: string,
    newName: string
  ) => {
    const { data, error } = await supabase
      .from("subcategories")
      .update({ name: newName })
      .eq("id", subcategoryId)
      .select("*, episodes!inner(count)")
      .single();

    if (error) {
      toast({
        title: "Erro ao atualizar subcategoria",
        description: error.message,
        variant: "destructive",
      });
    } else {
      const updatedSubcategory = {
        ...data,
        episode_count: data.episodes[0].count,
      };
      setCategories((prevCategories) =>
        prevCategories.map((c) =>
          c.id === updatedSubcategory.category_id
            ? {
                ...c,
                subcategories: c.subcategories?.map((s) =>
                  s.id === subcategoryId ? updatedSubcategory : s
                ),
              }
            : c
        )
      );
      toast({ title: "Sucesso!", description: "Subcategoria atualizada." });
      handleCloseModal();
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    const subcategoryToDelete = categories
      .flatMap((c) => c.subcategories || [])
      .find((s) => s.id === subcategoryId);
    if (!subcategoryToDelete) return;

    const { error } = await supabase
      .from("subcategories")
      .delete()
      .eq("id", subcategoryId);

    if (error) {
      toast({
        title: "Erro ao excluir subcategoria",
        description: "Verifique se não há episódios associados a ela.",
        variant: "destructive",
      });
    } else {
      setCategories((prevCategories) =>
        prevCategories.map((c) =>
          c.id === subcategoryToDelete.category_id
            ? {
                ...c,
                subcategories: c.subcategories?.filter(
                  (s) => s.id !== subcategoryId
                ),
              }
            : c
        )
      );
      toast({ title: "Sucesso!", description: "Subcategoria excluída." });
      handleCloseModal();
    }
  };

  const handleOpenModal = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedSubcategory(null);
    setIsModalOpen(false);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategoryId) return;
    const trimmedName = editingCategoryName.trim();
    if (!trimmedName) {
      toast({
        title: "Erro de validação",
        description: "O nome da categoria não pode estar vazio.",
        variant: "destructive",
      });
      return;
    }
    const originalCategory = categories.find((c) => c.id === editingCategoryId);
    if (originalCategory && originalCategory.name === trimmedName) {
      cancelEditing();
      return;
    }
    const { data, error } = await supabase
      .from("categories")
      .update({ name: trimmedName })
      .eq("id", editingCategoryId)
      .select()
      .single();
    if (error) {
      toast({
        title: "Erro ao atualizar categoria",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setCategories(
        categories.map((c) => (c.id === editingCategoryId ? data : c))
      );
      toast({ title: "Sucesso!", description: "Categoria atualizada." });
      cancelEditing();
    }
  };

  const startEditing = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const cancelEditing = () => {
    setEditingCategoryId(null);
    setEditingCategoryName("");
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= Math.ceil(totalCount / itemsPerPage)) {
      setCurrentPage(page);
    }
  };

  return {
    categories,
    loading,
    newCategoryName,
    setNewCategoryName,
    newSubcategoryNames,
    setNewSubcategoryNames,
    editingCategoryId,
    setEditingCategoryId,
    editingCategoryName,
    setEditingCategoryName,
    categorySearchTerm,
    setCategorySearchTerm,
    debouncedSearchTerm,
    open,
    setOpen,
    sortOrder,
    setSortOrder,
    sortType,
    setSortType,
    selectedSubcategory,
    setSelectedSubcategory,
    isModalOpen,
    setIsModalOpen,
    currentPage,
    setCurrentPage,
    totalCount,
    itemsPerPage,
    sortedCategories,
    handleAddCategory,
    handleDeleteCategory,
    handleAccordionChange,
    handleAddSubcategory,
    handleUpdateSubcategory,
    handleDeleteSubcategory,
    handleOpenModal,
    handleCloseModal,
    handleUpdateCategory,
    startEditing,
    cancelEditing,
    handlePageChange,
  };
}
