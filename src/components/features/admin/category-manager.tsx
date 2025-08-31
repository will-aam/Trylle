"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { useToast } from "@/src/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  description: string;
  episodeCount: number;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
  description?: string;
  episodeCount?: number;
}

interface ExpandedCategories {
  [key: string]: boolean;
}

const mockCategories: Category[] = [
  {
    id: "1",
    name: "Tecnologia",
    description: "IA, programação, inovação",
    episodeCount: 245,
  },
  {
    id: "2",
    name: "Educação",
    description: "Aprendizado, métodos, ensino",
    episodeCount: 189,
  },
  {
    id: "3",
    name: "Saúde",
    description: "Bem-estar, medicina, fitness",
    episodeCount: 156,
  },
];

const mockSubcategories: Subcategory[] = [
  {
    id: "10",
    name: "Entrevistas",
    category_id: "1",
    description: "Conversas com especialistas",
    episodeCount: 45,
  },
  {
    id: "11",
    name: "Tecnologia",
    category_id: "1",
    description: "Inovações tecnológicas",
    episodeCount: 120,
  },
  {
    id: "12",
    name: "Programação",
    category_id: "1",
    description: "Desenvolvimento de software",
    episodeCount: 80,
  },
  {
    id: "20",
    name: "Online",
    category_id: "2",
    description: "Educação digital",
    episodeCount: 95,
  },
  {
    id: "21",
    name: "Presencial",
    category_id: "2",
    description: "Educação tradicional",
    episodeCount: 94,
  },
  {
    id: "30",
    name: "Fitness",
    category_id: "3",
    description: "Exercícios e bem-estar",
    episodeCount: 78,
  },
  {
    id: "31",
    name: "Nutrição",
    category_id: "3",
    description: "Alimentação saudável",
    episodeCount: 78,
  },
];

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [subcategories, setSubcategories] =
    useState<Subcategory[]>(mockSubcategories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubDialogOpen, setIsSubDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] =
    useState<Subcategory | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [expandedCategories, setExpandedCategories] =
    useState<ExpandedCategories>({});
  const { toast } = useToast();

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCategory) {
      // Update existing category
      setCategories(
        categories.map((cat) =>
          cat.id === editingCategory.id ? { ...cat, name, description } : cat
        )
      );
      toast({
        title: "Categoria atualizada!",
        description: "A categoria foi atualizada com sucesso.",
      });
    } else {
      // Add new category
      const newCategory: Category = {
        id: Date.now().toString(),
        name,
        description,
        episodeCount: 0,
      };
      setCategories([...categories, newCategory]);
      toast({
        title: "Categoria criada!",
        description: "A nova categoria foi adicionada.",
      });
    }

    setName("");
    setDescription("");
    setEditingCategory(null);
    setIsDialogOpen(false);
  };

  const handleSubcategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingSubcategory) {
      // Update existing subcategory
      setSubcategories(
        subcategories.map((sub) =>
          sub.id === editingSubcategory.id
            ? { ...sub, name, description, category_id: selectedCategoryId }
            : sub
        )
      );
      toast({
        title: "Subcategoria atualizada!",
        description: "A subcategoria foi atualizada com sucesso.",
      });
    } else {
      // Add new subcategory
      const newSubcategory: Subcategory = {
        id: Date.now().toString(),
        name,
        description: description || "",
        category_id: selectedCategoryId,
        episodeCount: 0,
      };
      setSubcategories([...subcategories, newSubcategory]);
      toast({
        title: "Subcategoria criada!",
        description: "A nova subcategoria foi adicionada.",
      });
    }

    setName("");
    setDescription("");
    setSelectedCategoryId("");
    setEditingSubcategory(null);
    setIsSubDialogOpen(false);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description);
    setIsDialogOpen(true);
  };

  const handleEditSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setName(subcategory.name);
    setDescription(subcategory.description || "");
    setSelectedCategoryId(subcategory.category_id);
    setIsSubDialogOpen(true);
  };

  const handleDelete = (categoryId: string) => {
    // Remove category and its subcategories
    setCategories(categories.filter((cat) => cat.id !== categoryId));
    setSubcategories(
      subcategories.filter((sub) => sub.category_id !== categoryId)
    );
    toast({
      title: "Categoria removida!",
      description: "A categoria e suas subcategorias foram removidas.",
    });
  };

  const handleDeleteSubcategory = (subcategoryId: string) => {
    setSubcategories(subcategories.filter((sub) => sub.id !== subcategoryId));
    toast({
      title: "Subcategoria removida!",
      description: "A subcategoria foi removida com sucesso.",
    });
  };

  const getSubcategoriesForCategory = (categoryId: string) => {
    return subcategories.filter((sub) => sub.category_id === categoryId);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gerenciar Taxonomia</CardTitle>
          <div className="flex space-x-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingCategory(null);
                    setName("");
                    setDescription("");
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? "Editar Categoria" : "Nova Categoria"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome da Categoria</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Digite o nome..."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Digite a descrição..."
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {editingCategory ? "Atualizar" : "Criar"} Categoria
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isSubDialogOpen} onOpenChange={setIsSubDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingSubcategory(null);
                    setName("");
                    setDescription("");
                    setSelectedCategoryId("");
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Subcategoria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingSubcategory
                      ? "Editar Subcategoria"
                      : "Nova Subcategoria"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubcategorySubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="subcategory-name">
                      Nome da Subcategoria
                    </Label>
                    <Input
                      id="subcategory-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Digite o nome..."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="subcategory-description">Descrição</Label>
                    <Input
                      id="subcategory-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Digite a descrição..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="category-select">Categoria Pai</Label>
                    <select
                      id="category-select"
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" className="w-full">
                    {editingSubcategory ? "Atualizar" : "Criar"} Subcategoria
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="border rounded-md p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleCategory(category.id)}
                    className="h-6 w-6"
                  >
                    {expandedCategories[category.id] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(category.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <p className="text-sm text-muted-foreground ml-8 mb-2">
                {category.description}
              </p>
              <p className="text-xs font-medium ml-8 mb-3">
                {category.episodeCount} episódios
              </p>

              {expandedCategories[category.id] && (
                <div className="pl-8 mt-3 space-y-3 border-t pt-3">
                  {getSubcategoriesForCategory(category.id).map(
                    (subcategory) => (
                      <div
                        key={subcategory.id}
                        className="flex justify-between items-center p-2 bg-muted/50 rounded-md"
                      >
                        <div>
                          <span className="font-medium">
                            - {subcategory.name}
                          </span>
                          {subcategory.description && (
                            <p className="text-sm text-muted-foreground">
                              {subcategory.description}
                            </p>
                          )}
                          <p className="text-xs font-medium">
                            {subcategory.episodeCount || 0} episódios
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditSubcategory(subcategory)}
                            className="h-6 w-6"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDeleteSubcategory(subcategory.id)
                            }
                            className="h-6 w-6 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )
                  )}

                  <div className="flex space-x-2 pt-2">
                    <Input
                      placeholder="Nova subcategoria"
                      className="flex-1"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <Button
                      onClick={() => {
                        if (name.trim()) {
                          const newSubcategory: Subcategory = {
                            id: Date.now().toString(),
                            name: name.trim(),
                            category_id: category.id,
                            episodeCount: 0,
                          };
                          setSubcategories([...subcategories, newSubcategory]);
                          setName("");
                          toast({
                            title: "Subcategoria criada!",
                            description: "A nova subcategoria foi adicionada.",
                          });
                        }
                      }}
                    >
                      Adicionar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
