"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Category, Subcategory } from "@/src/lib/types";
import { useToast } from "@/src/hooks/use-toast";
import { categoryService } from "@/src/services/categoryService"; // Importe o serviço

export function useCategoryManager() {
  const { toast } = useToast();
  const isInitialMount = useRef(true);

  // ... (mantenha todos os useState daqui)
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

  // ... (mantenha os useEffect e o useMemo)
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
    try {
      const data = await categoryService.addCategory(newCategoryName);
      setCategories(
        [...categories, data].sort((a, b) => a.name.localeCompare(b.name))
      );
      setNewCategoryName("");
      toast({ title: "Sucesso!", description: "Categoria criada." });
    } catch (error: any) {
      toast({
        title: "Erro ao criar categoria",
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

      try {
        const subData = await categoryService.fetchSubcategories(categoryId);
        setCategories((prevCategories) => {
          const newCategories = [...prevCategories];
          const catIndex = newCategories.findIndex((c) => c.id === categoryId);
          if (catIndex !== -1) {
            newCategories[catIndex] = {
              ...newCategories[catIndex],
              subcategories: subData,
              subcategoriesLoading: false,
            };
          }
          return newCategories;
        });
      } catch (error: any) {
        toast({
          title: "Erro ao carregar subcategorias",
          description: error.message,
          variant: "destructive",
        });
        const errorCategories = [...categories];
        errorCategories[categoryIndex] = {
          ...errorCategories[categoryIndex],
          subcategoriesLoading: false,
        };
        setCategories(errorCategories);
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
      handleCloseModal();
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
      handleCloseModal();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir subcategoria",
        description: error.message,
        variant: "destructive",
      });
    }
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
    try {
      const data = await categoryService.updateCategory(
        editingCategoryId,
        trimmedName
      );
      setCategories(
        categories.map((c) =>
          c.id === editingCategoryId ? { ...c, ...data } : c
        )
      );
      toast({
        title: "Sucesso!",
        description: "Categoria atualizada com sucesso!",
      });
      cancelEditing();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar categoria",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // ... (mantenha o restante das funções auxiliares: handleOpenModal, handleCloseModal, startEditing, cancelEditing, handlePageChange)
  const handleOpenModal = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedSubcategory(null);
    setIsModalOpen(false);
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
