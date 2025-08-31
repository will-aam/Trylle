"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { useToast } from "@/src/hooks/use-toast";
import { Upload, Plus } from "lucide-react";

type Category = { id: string; name: string; created_at: string };
type Subcategory = { id: string; name: string; category_id: string };

export function UploadForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([
    { id: "1", name: "Podcast", created_at: "" },
    { id: "2", name: "Música", created_at: "" },
    { id: "3", name: "Educacional", created_at: "" },
  ]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const allMockSubcategories: Subcategory[] = [
    { id: "10", name: "Entrevistas", category_id: "1" },
    { id: "11", name: "Tecnologia", category_id: "1" },
    { id: "20", name: "Rock", category_id: "2" },
  ];

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    subcategoryId: "",
    tags: "",
    publishedAt: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (selectedCategory) {
      const filteredSubcategories = allMockSubcategories.filter(
        (sub) => sub.category_id === selectedCategory
      );
      setSubcategories(filteredSubcategories);
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory]);

  const createCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const newCat = {
        id: Math.random().toString(36).substring(7),
        name: newCategory.trim(),
        created_at: new Date().toISOString(),
      };

      setCategories([...categories, newCat]);
      setFormData({ ...formData, categoryId: newCat.id });
      setSelectedCategory(newCat.id);
      setNewCategory("");
      setShowNewCategory(false);

      toast({
        title: "Categoria criada (Simulação)",
        description: "Nova categoria adicionada com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro (Simulação)",
        description: error.message || "Erro ao criar categoria",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("audio/")) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione um arquivo de áudio válido.",
          variant: "destructive",
        });
        return;
      }

      setAudioFile(file);

      if (!formData.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        setFormData({ ...formData, title: fileName });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Envio em simulação!",
      description: "O formulário seria enviado para o back-end agora.",
    });
    console.log("Form Data Submitted:", {
      ...formData,
      audioFile: audioFile?.name,
    });
  };

  return (
    // O Card agora é um container flexível que ocupa a altura disponível
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Novo Episódio
          </CardTitle>
        </CardHeader>
        {/* A área de conteúdo agora tem rolagem interna */}
        <CardContent className="flex-1 overflow-y-auto pr-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coluna 1: Informações Principais */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Digite o título do episódio"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descreva o conteúdo do episódio"
                  rows={8}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Coluna 2: Metadados e Arquivo */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="audio-file">Arquivo de Áudio *</Label>
                <Input
                  id="audio-file"
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="mt-1"
                />
                {audioFile && (
                  <p className="text-sm text-gray-500 mt-1">
                    Arquivo: {audioFile.name}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label>Categoria</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewCategory(!showNewCategory)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Nova
                  </Button>
                </div>
                {showNewCategory && (
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Nome da nova categoria"
                    />
                    <Button type="button" onClick={createCategory}>
                      Criar
                    </Button>
                  </div>
                )}
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => {
                    setFormData({
                      ...formData,
                      categoryId: value,
                      subcategoryId: "",
                    });
                    setSelectedCategory(value);
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Subcategoria</Label>
                <Select
                  value={formData.subcategoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, subcategoryId: value })
                  }
                  disabled={!selectedCategory || subcategories.length === 0}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue
                      placeholder={
                        !selectedCategory
                          ? "Selecione uma categoria primeiro"
                          : "Selecione uma subcategoria"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="tech, podcast"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="published-at">Data de Publicação</Label>
                  <Input
                    id="published-at"
                    type="date"
                    value={formData.publishedAt}
                    onChange={(e) =>
                      setFormData({ ...formData, publishedAt: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        {/* O botão de envio agora fica em um rodapé fixo */}
        <CardFooter className="border-t pt-6">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto ml-auto"
          >
            {isLoading ? "Enviando..." : "Enviar Episódio"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
