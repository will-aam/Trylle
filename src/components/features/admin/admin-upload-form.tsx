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
import { createClient } from "@/src/lib/supabase-client";
import { Category, Subcategory } from "@/src/lib/types";

export function UploadForm() {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
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
    const loadCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) {
        console.error("Erro ao carregar categorias:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as categorias.",
          variant: "destructive",
        });
      } else {
        setCategories(data || []);
      }
    };
    loadCategories();
  }, [supabase, toast]);

  useEffect(() => {
    if (selectedCategory) {
      const loadSubcategories = async () => {
        const { data, error } = await supabase
          .from("subcategories")
          .select("*")
          .eq("category_id", selectedCategory)
          .order("name");

        if (error) {
          console.error("Erro ao carregar subcategorias:", error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar as subcategorias.",
            variant: "destructive",
          });
        } else {
          setSubcategories(data || []);
        }
      };
      loadSubcategories();
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory, supabase, toast]);

  const createCategory = async () => {
    if (!newCategory.trim()) return;
    const { data, error } = await supabase
      .from("categories")
      .insert([{ name: newCategory.trim() }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro ao criar categoria",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setCategories([...categories, data]);
      setFormData({ ...formData, categoryId: data.id });
      setSelectedCategory(data.id);
      setNewCategory("");
      setShowNewCategory(false);
      toast({
        title: "Categoria criada!",
        description: "Nova categoria adicionada com sucesso.",
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

    if (!audioFile || !formData.title.trim()) {
      toast({
        title: "Campos obrigatórios",
        description:
          "Por favor, selecione um arquivo de áudio e preencha o título.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Enviar o arquivo para a nossa API de upload segura
      const body = new FormData();
      body.append("file", audioFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body,
      });

      const { publicUrl, error: uploadError } = await response.json();

      if (!response.ok || uploadError) {
        throw new Error(uploadError || "Falha ao fazer upload do arquivo.");
      }

      // 2. Preparar e inserir os dados do episódio no Supabase
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      const { error: insertError } = await supabase.from("episodes").insert([
        {
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          audio_url: publicUrl, // A nova URL do Cloudflare R2!
          file_name: audioFile.name,
          category_id: formData.categoryId || null,
          subcategory_id: formData.subcategoryId || null,
          tags: tagsArray.length > 0 ? tagsArray : null,
          published_at: new Date(formData.publishedAt).toISOString(),
        },
      ]);

      if (insertError) throw insertError;

      toast({
        title: "Sucesso!",
        description: "Episódio enviado com sucesso!",
      });

      // Limpa o formulário
      setFormData({
        title: "",
        description: "",
        categoryId: "",
        subcategoryId: "",
        tags: "",
        publishedAt: new Date().toISOString().split("T")[0],
      });
      setAudioFile(null);
      setSelectedCategory("");
    } catch (error: any) {
      console.error("Erro no processo de upload:", error);
      toast({
        title: "Erro no upload",
        description: error.message || "Ocorreu um erro ao enviar o episódio.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  // até aqui
  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Novo Episódio
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <Plus className="h-4 w-4 mr-1" /> Nova
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
