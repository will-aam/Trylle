"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  startTransition,
} from "react";
import { Category, Subcategory } from "@/src/lib/types";
import { useToast } from "@/src/hooks/use-toast";
import { CategoryFormData } from "@/src/lib/schemas";

import {
  listCategoriesAction,
  listSubcategoriesByCategoryAction,
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  createSubcategoryAction,
  updateSubcategoryAction,
  deleteSubcategoryAction,
} from "@/src/app/admin/categories/actions";

/**
 * Hook de gerenciamento de categorias refatorado para usar Server Actions.
 * Mantém a API pública original (nomes das funções retornadas) para evitar
 * quebrar componentes existentes.
 */
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

  // Carrega lista paginada de categorias
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Chamada à server action
      const result = await listCategoriesAction({
        page: currentPage,
        perPage: itemsPerPage,
        search: debouncedSearchTerm,
        sortType,
        sortOrder,
      });

      if (!result.success) {
        throw new Error(result.error || "Falha ao listar categorias.");
      }

      // O server action já aplicou sorted (quando episodes)
      setCategories(
        result.data.map((c) => ({
          ...c,
          episode_count: c.episode_count, // manter coerência
        }))
      );
      setTotalCount(result.count);
    } catch (error: any) {
      toast({
        title: "Erro ao buscar dados",
        description: error.message || "Não foi possível carregar.",
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

  /* Debounce da busca */
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(categorySearchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [categorySearchTerm]);

  /* Reset página quando termo de busca muda (após primeira montagem) */
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm]);

  /* Carregar categorias quando dependências mudam */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* Ordenação (client-side adicional — mesma lógica que antes) */
  const sortedCategories = useMemo(() => {
    // Como a server action já faz sort principal (name) e retornamos contagem,
    // se quiser reforçar ordenação por episodes no client, mantemos.
    if (sortType === "episodes") {
      return [...categories].sort((a: any, b: any) =>
        sortOrder === "asc"
          ? (a.episode_count || 0) - (b.episode_count || 0)
          : (b.episode_count || 0) - (a.episode_count || 0)
      );
    }
    if (sortType === "name") {
      return [...categories].sort((a, b) =>
        sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      );
    }
    return categories;
  }, [categories, sortType, sortOrder]);

  /* Criação / Atualização de Categoria */
  const handleSaveCategory = async (
    data: CategoryFormData & { id?: string }
  ) => {
    try {
      if (editingCategory) {
        // ATUALIZAÇÃO: garantir que color_theme seja enviado
        const result = await updateCategoryAction({
          id: editingCategory.id,
          name: data.name.trim(),
        });
        if (!result.success) throw new Error(result.error);
        toast({
          title: "Sucesso!",
          description: "Categoria atualizada com sucesso.",
        });
      } else {
        // CRIAÇÃO: enviar color_theme também
        const result = await createCategoryAction({
          name: data.name.trim(),
        });
        if (!result.success) throw new Error(result.error);
        toast({
          title: "Sucesso!",
          description: "Categoria criada.",
        });
      }
      await fetchData();
      closeCategoryModal();
    } catch (error: any) {
      toast({
        title: `Erro ao ${editingCategory ? "atualizar" : "criar"} categoria`,
        description: error.message || "Operação falhou.",
        variant: "destructive",
      });
    }
  };

  /* Exclusão de Categoria */
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const result = await deleteCategoryAction(categoryId);
      if (!result.success) throw new Error(result.error);
      // Recarregar
      await fetchData();
      toast({
        title: "Sucesso!",
        description: "Categoria e subcategorias excluídas.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message || "Operação falhou.",
        variant: "destructive",
      });
    }
  };

  /* Expandir acordeão → carregar subcategorias sob demanda */
  const handleAccordionChange = async (categoryId: string) => {
    if (!categoryId) return;
    const cat = categories.find((c: any) => c.id === categoryId);
    // Evitar refetch se já temos subcategories carregadas
    if (cat && (cat as any).subcategories) return;

    try {
      const result = await listSubcategoriesByCategoryAction(categoryId);
      if (!result.success) throw new Error(result.error);
      const subData = result.data;
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                subcategories: subData
                  .map((s) => ({
                    ...s,
                  }))
                  .sort((a, b) => a.name.localeCompare(b.name)),
              }
            : c
        )
      );
    } catch (error: any) {
      toast({
        title: "Erro ao carregar subcategorias",
        description: error.message || "Falha ao carregar.",
        variant: "destructive",
      });
    }
  };

  /* Criar Subcategoria */
  const handleAddSubcategory = async (categoryId: string) => {
    const subcategoryName = newSubcategoryNames[categoryId];
    if (!subcategoryName || !subcategoryName.trim()) return;

    try {
      const result = await createSubcategoryAction({
        categoryId,
        name: subcategoryName.trim(),
      });
      if (!result.success) throw new Error(result.error);

      const newSub = result.subcategory;

      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                subcategories: c.subcategories
                  ? [...c.subcategories, newSub].sort((a, b) =>
                      a.name.localeCompare(b.name)
                    )
                  : [newSub],
              }
            : c
        )
      );
      setNewSubcategoryNames((prev) => ({ ...prev, [categoryId]: "" }));
      toast({ title: "Sucesso!", description: "Subcategoria criada." });
    } catch (error: any) {
      toast({
        title: "Erro ao criar subcategoria",
        description: error.message || "Operação falhou.",
        variant: "destructive",
      });
    }
  };

  /* Atualizar Subcategoria */
  const handleUpdateSubcategory = async (
    subcategoryId: string,
    newName: string
  ) => {
    try {
      const result = await updateSubcategoryAction({
        id: subcategoryId,
        name: newName.trim(),
      });
      if (!result.success) throw new Error(result.error);

      const updated = result.subcategory;

      setCategories((prev) =>
        prev.map((c) =>
          c.id === updated.category_id
            ? {
                ...c,
                subcategories: c.subcategories?.map((s) =>
                  s.id === subcategoryId ? updated : s
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
        description: error.message || "Operação falhou.",
        variant: "destructive",
      });
    }
  };

  /* Excluir Subcategoria */
  const handleDeleteSubcategory = async (subcategoryId: string) => {
    const subcategoryToDelete = categories
      .flatMap((c: any) => c.subcategories || [])
      .find((s: any) => s.id === subcategoryId);
    if (!subcategoryToDelete) return;

    try {
      const result = await deleteSubcategoryAction(subcategoryId);
      if (!result.success) throw new Error(result.error);

      setCategories((prev) =>
        prev.map((c) =>
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
        description: error.message || "Operação falhou.",
        variant: "destructive",
      });
    }
  };

  /* Modal handlers */
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

  /* Paginação */
  const handlePageChange = (page: number) => {
    const max = Math.ceil(totalCount / itemsPerPage);
    if (page > 0 && page <= max) {
      // startTransition opcional se quiser feedback diferido
      startTransition(() => {
        setCurrentPage(page);
      });
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
    // future: setItemsPerPage if você quiser expor
    setItemsPerPage,
  };
}
