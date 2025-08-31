"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { createClient } from "@/src/lib/supabase-client";
import { Category, Subcategory, Tag } from "@/src/lib/types"; // Importa o novo tipo Tag
import { useToast } from "@/src/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
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
import { Badge } from "@/src/components/ui/badge";

// O nome do componente é alterado para refletir sua nova função
export function CategoryManager() {
  const supabase = createClient();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [tags, setTags] = useState<Tag[]>([]); // Estado para as tags
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTagName, setNewTagName] = useState(""); // Estado para a nova tag

  const [newSubcategoryNames, setNewSubcategoryNames] = useState<{
    [key: string]: string;
  }>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    // Busca todos os dados em paralelo para mais eficiência
    const [catRes, subRes, tagRes] = await Promise.all([
      supabase.from("categories").select("*").order("name"),
      supabase.from("subcategories").select("*").order("name"),
      supabase.from("tags").select("*").order("name"),
    ]);

    if (catRes.error || subRes.error || tagRes.error) {
      console.error(
        "Erro ao buscar dados:",
        catRes.error || subRes.error || tagRes.error
      );
      toast({
        title: "Erro",
        description: "Não foi possível carregar a taxonomia.",
        variant: "destructive",
      });
    } else {
      setCategories(catRes.data || []);
      setSubcategories(subRes.data || []);
      setTags(tagRes.data || []);
    }
    setLoading(false);
  }, [supabase, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Funções de Manipulação ---

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

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    const { data, error } = await supabase
      .from("tags")
      .insert([{ name: newTagName.trim().toLowerCase() }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro ao criar tag",
        description: "Talvez essa tag já exista.",
        variant: "destructive",
      });
    } else {
      setTags([...tags, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewTagName("");
      toast({ title: "Sucesso!", description: "Tag criada." });
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    const { error } = await supabase.from("tags").delete().eq("id", tagId);
    if (error) {
      toast({
        title: "Erro ao excluir tag",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setTags(tags.filter((t) => t.id !== tagId));
      toast({ title: "Sucesso!", description: "Tag excluída." });
    }
  };

  if (loading) {
    return <p>Carregando taxonomia...</p>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Categorias e Subcategorias</CardTitle>
            <CardDescription>
              Adicione, visualize e remova categorias e suas subcategorias.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2 border p-4 rounded-lg">
              <Input
                placeholder="Nome da nova categoria principal"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              />
              <Button onClick={handleAddCategory}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Categoria
              </Button>
            </div>
            <div className="border rounded-md p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <div
                    key={category.id}
                    className="p-2 border rounded-md bg-card"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700"
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
                    <div className="pl-4 mt-2 space-y-2">
                      {subcategories
                        .filter((sub) => sub.category_id === category.id)
                        .map((sub) => (
                          <div
                            key={sub.id}
                            className="flex justify-between items-center text-sm group"
                          >
                            <span className="text-muted-foreground">
                              - {sub.name}
                            </span>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
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
                                    excluirá permanentemente a subcategoria "
                                    {sub.name}".
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
                          </div>
                        ))}
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
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Nenhuma categoria encontrada. Adicione uma acima para
                    começar.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
            <CardDescription>
              Gerencie todas as tags do seu site.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Nome da nova tag"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              />
              <Button onClick={handleAddTag}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar
              </Button>
            </div>
            <div className="border rounded-md p-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <AlertDialog key={tag.id}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <AlertDialogTrigger asChild>
                              <Badge
                                variant="secondary"
                                className="cursor-pointer hover:bg-destructive/80"
                              >
                                {tag.name}
                              </Badge>
                            </AlertDialogTrigger>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Clique para excluir a tag</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Excluir a tag "{tag.name}"?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. A tag será removida
                            de todos os episódios que a utilizam.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteTag(tag.id)}
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma tag criada.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
