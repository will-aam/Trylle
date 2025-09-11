"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import {
  Card,
  CardContent,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { cn } from "@/src/lib/utils";

const Accordion = AccordionPrimitive.Root;
const AccordionItem = AccordionPrimitive.Item;
const AccordionContent = AccordionPrimitive.Content;

export function CategoryManager() {
  const supabase = createClient();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
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
  const [open, setOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [catRes, subRes] = await Promise.all([
      supabase.from("categories").select("*").order("name"),
      supabase.from("subcategories").select("*").order("name"),
    ]);

    if (catRes.error || subRes.error) {
      console.error("Erro ao buscar dados:", catRes.error || subRes.error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a taxonomia.",
        variant: "destructive",
      });
    } else {
      setCategories(catRes.data || []);
      setSubcategories(subRes.data || []);
    }
    setLoading(false);
  }, [supabase, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredCategories = useMemo(() => {
    const sortedCategories = [...categories].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

    if (!categorySearchTerm.trim()) {
      return sortedCategories;
    }
    return sortedCategories.filter(
      (category) =>
        category.name
          .toLowerCase()
          .includes(categorySearchTerm.toLowerCase()) ||
        subcategories.some(
          (sub) =>
            sub.category_id === category.id &&
            sub.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
        )
    );
  }, [categories, subcategories, categorySearchTerm, sortOrder]);

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

  const handleAddSubcategory = async (categoryId: string) => {
    const subcategoryName = newSubcategoryNames[categoryId];
    if (!subcategoryName || !subcategoryName.trim()) return;
    const { data, error } = await supabase
      .from("subcategories")
      .insert([{ name: subcategoryName.trim(), category_id: categoryId }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro ao criar subcategoria",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSubcategories(
        [...subcategories, data].sort((a, b) => a.name.localeCompare(b.name))
      );
      setNewSubcategoryNames({ ...newSubcategoryNames, [categoryId]: "" });
      toast({ title: "Sucesso!", description: "Subcategoria criada." });
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

  const handleDeleteSubcategory = async (subcategoryId: string) => {
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
      setSubcategories(subcategories.filter((s) => s.id !== subcategoryId));
      toast({ title: "Sucesso!", description: "Subcategoria excluída." });
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

  if (loading) {
    return <p>Carregando taxonomia...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categorias e Subcategorias</CardTitle>
        <CardDescription>
          Exibindo {categories.length} categorias e {subcategories.length}{" "}
          subcategorias.
        </CardDescription>

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
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            <ArrowDownUp className="h-4 w-4" />
          </Button>
          <div className="flex space-x-2">
            <Input
              placeholder="Nome da nova categoria"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
            />
            <Button onClick={handleAddCategory} className="whitespace-nowrap">
              <Plus className="mr-2 h-4 w-4" /> Adicionar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full space-y-2">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
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
                        <span onDoubleClick={() => startEditing(category)}>
                          {category.name}
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
                          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
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
                  <div className="pl-4 mt-2 space-y-2">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome da Subcategoria</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subcategories
                          .filter((sub) => sub.category_id === category.id)
                          .map((sub) => (
                            <TableRow key={sub.id}>
                              <TableCell>{sub.name}</TableCell>
                              <TableCell className="text-right">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-red-500"
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
                                        Esta ação não pode ser desfeita. Isso
                                        excluirá permanentemente a subcategoria
                                        "{sub.name}".
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancelar
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteSubcategory(sub.id)
                                        }
                                      >
                                        Excluir
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                    <div className="flex space-x-2 pt-2">
                      <Input
                        placeholder="Nova subcategoria"
                        className="h-8"
                        value={newSubcategoryNames[category.id] || ""}
                        onChange={(e) =>
                          setNewSubcategoryNames({
                            ...newSubcategoryNames,
                            [category.id]: e.target.value,
                          })
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleAddSubcategory(category.id)
                        }
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddSubcategory(category.id)}
                      >
                        <Plus className="mr-1 h-4 w-4" /> Adicionar
                      </Button>
                    </div>
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
      </CardContent>
    </Card>
  );
}
