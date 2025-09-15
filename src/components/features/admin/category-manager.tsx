"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { createClient } from "@/src/lib/supabase-client";
import { Category, Subcategory } from "@/src/lib/types";
import { useToast } from "@/src/hooks/use-toast";
import {
  Plus,
  Trash2,
  Search,
  ChevronsUpDown,
  ArrowDownUp,
  Pencil,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/src/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/src/components/ui/command";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/src/components/ui/pagination";
import { Skeleton } from "@/src/components/ui/skeleton";
import { SubcategoryActionsModal } from "./SubcategoryActionsModal";
import { cn } from "@/src/lib/utils";

const Accordion = AccordionPrimitive.Root;
const AccordionItem = AccordionPrimitive.Item;
const AccordionContent = AccordionPrimitive.Content;

function CategoryListSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="border rounded-md px-4 py-3 bg-muted/50 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-10" />
          </div>
          <Skeleton className="h-4 w-4" />
        </div>
      ))}
    </div>
  );
}

export function CategoryManager() {
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
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    let query = supabase
      .from("categories")
      .select("*, episodes!inner(count)", { count: "exact" });

    if (debouncedSearchTerm) {
      query = query.ilike("name", `%${debouncedSearchTerm}%`);
    }

    query = query.order(sortType === "name" ? "name" : "episodes(count)", {
      ascending: sortOrder === "asc",
      foreignTable: sortType === "episodes" ? "episodes" : undefined,
    });

    const {
      data: catData,
      error: catError,
      count: catCount,
    } = await query.range(from, to);

    if (catError) {
      console.error("Error fetching data:", catError);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a taxonomia.",
        variant: "destructive",
      });
    } else {
      const categoriesWithCount = (catData || []).map((c) => ({
        ...c,
        episode_count: c.episodes[0].count,
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
    }, 500); // 500ms delay

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

    // Somente busca se as subcategorias ainda não foram carregadas
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
        // Reset loading state on error
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

        const finalCategories = [...categories];
        finalCategories[categoryIndex] = {
          ...finalCategories[categoryIndex],
          subcategories: subcategoriesWithCount,
          subcategoriesLoading: false,
        };
        // This is a bit tricky. When we set the state, the component re-renders.
        // If we use `categories` from the closure, it will be stale.
        // A functional update is better here.
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categorias e Subcategorias</CardTitle>
        <CardDescription>Gerencie a taxonomia do seu conteúdo.</CardDescription>
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <div className="relative flex-1">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {categorySearchTerm || "Buscar categorias..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder="Buscar categoria..."
                    onValueChange={setCategorySearchTerm}
                  />
                  <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                  <CommandGroup>
                    {categories.map((category) => (
                      <CommandItem
                        key={category.id}
                        onSelect={() => {
                          setCategorySearchTerm(category.name);
                          setOpen(false);
                        }}
                      >
                        {category.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={sortType === "name" ? "secondary" : "outline"}
              onClick={() => setSortType("name")}
            >
              Nome
            </Button>
            <Button
              variant={sortType === "episodes" ? "secondary" : "outline"}
              onClick={() => setSortType("episodes")}
            >
              Episódios
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              <ArrowDownUp className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex space-x-2">
            <Input
              placeholder="Nome da nova categoria"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
            />
            <Button onClick={handleAddCategory} className="whitespace-nowrap">
              <Plus className="mr-2 h-4 w-4" /> Adicionar Categoria
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <CategoryListSkeleton />
        ) : (
          <Accordion
            type="single"
            collapsible
            className="w-full space-y-2"
            onValueChange={handleAccordionChange}
          >
            {sortedCategories.length > 0 ? (
              sortedCategories.map((category) => (
                <AccordionItem
                  key={category.id}
                  value={category.id}
                  className="border rounded-md px-4 bg-muted/50"
                >
                  <AccordionPrimitive.Header className="flex items-center w-full py-2">
                    <AccordionPrimitive.Trigger className="flex flex-1 items-center gap-3 text-left font-semibold group">
                      <span>
                        {editingCategoryId === category.id ? (
                          <Input
                            value={editingCategoryName}
                            onChange={(e) =>
                              setEditingCategoryName(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleUpdateCategory();
                              if (e.key === "Escape") cancelEditing();
                            }}
                            onBlur={handleUpdateCategory}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                            className="h-9"
                          />
                        ) : (
                          <span
                            onDoubleClick={() => startEditing(category)}
                            className="flex items-center"
                          >
                            {category.name}
                            <span className="ml-2 text-muted-foreground font-normal">
                              ({category.episode_count})
                            </span>
                            {category.episode_count === 0 && (
                              <AlertCircle className="ml-2 h-4 w-4 text-yellow-500" />
                            )}
                          </span>
                        )}
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </AccordionPrimitive.Trigger>

                    <div className="flex-shrink-0 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEditing(category)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Você tem certeza?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Isso excluirá
                              permanentemente a categoria "{category.name}" e
                              TODAS as suas subcategorias.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </AccordionPrimitive.Header>
                  <AccordionContent className="pt-2 pb-4">
                    <div className="pl-4 mt-2 space-y-4">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Nova subcategoria"
                          className="h-9"
                          value={newSubcategoryNames[category.id] || ""}
                          onChange={(e) =>
                            setNewSubcategoryNames({
                              ...newSubcategoryNames,
                              [category.id]: e.target.value,
                            })
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            handleAddSubcategory(category.id)
                          }
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddSubcategory(category.id)}
                        >
                          <Plus className="mr-1 h-4 w-4" /> Adicionar
                        </Button>
                      </div>

                      {category.subcategoriesLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {[...Array(3)].map((_, i) => (
                            <Skeleton
                              key={i}
                              className="h-9 w-full rounded-md"
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {category.subcategories?.map((sub) => (
                            <div
                              key={sub.id}
                              className="bg-background rounded-md p-2 text-sm font-medium cursor-pointer hover:bg-accent transition-colors border flex justify-center items-center gap-2"
                              onClick={() => handleOpenModal(sub)}
                            >
                              <span>
                                {sub.name} ({sub.episode_count})
                              </span>
                              {sub.episode_count === 0 && (
                                <AlertCircle className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Nenhuma categoria encontrada.
                </p>
              </div>
            )}
          </Accordion>
        )}
      </CardContent>
      <SubcategoryActionsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        subcategory={selectedSubcategory}
        onEdit={handleUpdateSubcategory}
        onDelete={handleDeleteSubcategory}
      />
      {totalCount > itemsPerPage && (
        <CardFooter>
          <div className="mt-4 flex justify-center w-full">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage - 1);
                    }}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="text-sm px-4">
                    Página {currentPage} de{" "}
                    {Math.ceil(totalCount / itemsPerPage)}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage + 1);
                    }}
                    className={
                      currentPage === Math.ceil(totalCount / itemsPerPage)
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
