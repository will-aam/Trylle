"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Category, Subcategory } from "@/src/lib/types";
import { useToast } from "@/src/hooks/use-toast";
import { categoryService } from "@/src/services/categoryService";
import { CategoryFormData } from "@/src/lib/schemas";

export function useCategoryManager() {
  const { toast } = useToast();
  const isInitialMount = useRef(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSubcategoryNames, setNewSubcategoryNames] = useState<{
    [key: string]: string;
  }>({});
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] =
    useState(categorySearchTerm);
  const [open, setOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortType, setSortType] = useState<"name" | "episodes">("name");
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<Subcategory | null>(null);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, count } = await categoryService.fetchCategories({
        currentPage,
        itemsPerPage,
        debouncedSearchTerm,
        sortType,
        sortOrder,
      });
      setCategories(data);
      setTotalCount(count);
    } catch (error: any) {
      toast({
        title: "Erro ao buscar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    debouncedSearchTerm,
    sortType,
    sortOrder,
    toast,
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
  }, [fetchData]);

  const sortedCategories = useMemo(() => {
    // A ordenação já é feita no backend, mas podemos manter uma ordenação no cliente como fallback
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

  const handleSaveCategory = async (data: CategoryFormData) => {
    try {
      let savedCategory;
      if (editingCategory) {
        savedCategory = await categoryService.updateCategory(
          editingCategory.id,
          data
        );
        toast({
          title: "Sucesso!",
          description: "Categoria atualizada com sucesso!",
        });
      } else {
        savedCategory = await categoryService.addCategory(data);
        toast({ title: "Sucesso!", description: "Categoria criada." });
      }
      await fetchData(); // Re-fetch all data to ensure consistency
      closeCategoryModal();
    } catch (error: any) {
      toast({
        title: `Erro ao ${editingCategory ? "atualizar" : "criar"} categoria`,
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await categoryService.deleteCategory(categoryId);
      fetchData(); // Re-fetch para atualizar a lista
      toast({
        title: "Sucesso!",
        description: "Categoria e suas subcategorias foram excluídas.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAccordionChange = async (categoryId: string) => {
    if (!categoryId) return;
    const category = categories.find((c) => c.id === categoryId);
    if (category && !category.subcategories) {
      // Logic to fetch subcategories if they haven't been fetched yet
      try {
        const subData = await categoryService.fetchSubcategories(categoryId);
        setCategories((prev) =>
          prev.map((c) =>
            c.id === categoryId
              ? { ...c, subcategories: subData, subcategoriesLoading: false }
              : c
          )
        );
      } catch (error: any) {
        toast({
          title: "Erro ao carregar subcategorias",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleAddSubcategory = async (categoryId: string) => {
    const subcategoryName = newSubcategoryNames[categoryId];
    if (!subcategoryName || !subcategoryName.trim()) return;
    try {
      const newSubcategory = await categoryService.addSubcategory(
        subcategoryName,
        categoryId
      );
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
    } catch (error: any) {
      toast({
        title: "Erro ao criar subcategoria",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateSubcategory = async (
    subcategoryId: string,
    newName: string
  ) => {
    try {
      const updatedSubcategory = await categoryService.updateSubcategory(
        subcategoryId,
        newName
      );
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
      closeSubcategoryModal();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar subcategoria",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    const subcategoryToDelete = categories
      .flatMap((c) => c.subcategories || [])
      .find((s) => s.id === subcategoryId);
    if (!subcategoryToDelete) return;
    try {
      await categoryService.deleteSubcategory(subcategoryId);
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
      closeSubcategoryModal();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir subcategoria",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openCategoryModal = (category: Category | null = null) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(false);
  };

  const openSubcategoryModal = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    setIsSubcategoryModalOpen(true);
  };

  const closeSubcategoryModal = () => {
    setSelectedSubcategory(null);
    setIsSubcategoryModalOpen(false);
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= Math.ceil(totalCount / itemsPerPage)) {
      setCurrentPage(page);
    }
  };

  return {
    categories,
    loading,
    newSubcategoryNames,
    setNewSubcategoryNames,
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
    isSubcategoryModalOpen,
    isCategoryModalOpen,
    editingCategory,
    currentPage,
    totalCount,
    itemsPerPage,
    sortedCategories,
    handleDeleteCategory,
    handleAccordionChange,
    handleAddSubcategory,
    handleUpdateSubcategory,
    handleDeleteSubcategory,
    openSubcategoryModal,
    closeSubcategoryModal,
    openCategoryModal,
    closeCategoryModal,
    handleSaveCategory,
    handlePageChange,
  };
}
