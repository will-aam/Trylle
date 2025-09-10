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
import RichTextEditor from "../../ui/RichTextEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { useToast } from "@/src/hooks/use-toast";
import { Upload } from "lucide-react";
import { createClient } from "@/src/lib/supabase-client";
import { Category, Subcategory, Tag } from "@/src/lib/types";
import { TagSelector } from "./TagSelector";

export function UploadForm() {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);

  const { toast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    subcategoryId: "",
    publishedAt: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const loadInitialData = async () => {
      const { data: catData } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      setCategories(catData || []);
    };
    loadInitialData();
  }, [supabase]);

  useEffect(() => {
    if (selectedCategory) {
      const loadSubcategories = async () => {
        const { data } = await supabase
          .from("subcategories")
          .select("*")
          .eq("category_id", selectedCategory)
          .order("name");
        setSubcategories(data || []);
      };
      loadSubcategories();
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory, supabase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("audio/")) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione um arquivo de áudio.",
          variant: "destructive",
        });
        return;
      }
      setAudioFile(file);
      if (!formData.title) {
        setFormData({ ...formData, title: file.name.replace(/\.[^/.]+$/, "") });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile || !formData.title.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Áudio e Título são necessários.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);

    try {
      // 1. Pedir a Pre-signed URL para a nossa nova API
      const presignedUrlResponse = await fetch("/api/generate-presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: audioFile.name,
          fileType: audioFile.type,
        }),
      });

      if (!presignedUrlResponse.ok) {
        const errorData = await presignedUrlResponse.json();
        throw new Error(errorData.error || "Falha ao preparar o upload.");
      }

      const { signedUrl, publicUrl, originalFileName } =
        await presignedUrlResponse.json();

      // 2. Fazer o upload do arquivo diretamente para o R2
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        body: audioFile,
        headers: { "Content-Type": audioFile.type },
      });

      if (!uploadResponse.ok) {
        throw new Error("Falha no upload do arquivo para o armazenamento.");
      }

      // 3. Salvar os metadados no Supabase
      const { data: episodeData, error: insertError } = await supabase
        .from("episodes")
        .insert([
          {
            title: formData.title.trim(),
            description: formData.description.trim() || null,
            audio_url: publicUrl,
            file_name: originalFileName,
            category_id: formData.categoryId || null,
            subcategory_id: formData.subcategoryId || null,
            published_at: new Date(formData.publishedAt).toISOString(),
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      if (selectedTags.length > 0) {
        const episodeTags = selectedTags.map((tag) => ({
          episode_id: episodeData.id,
          tag_id: tag.id,
        }));
        await supabase.from("episode_tags").insert(episodeTags);
      }

      // Upload de documentos de apoio
      if (documentFiles.length > 0) {
        toast({
          title: "Enviando anexos...",
          description: `Iniciando o upload de ${documentFiles.length} documento(s).`,
        });
        for (const file of documentFiles) {
          try {
            const presignedUrlResponse = await fetch(
              "/api/generate-presigned-url-document",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  fileName: file.name,
                  fileType: file.type,
                }),
              }
            );

            if (!presignedUrlResponse.ok) {
              throw new Error(
                `Falha ao obter URL para o documento ${file.name}`
              );
            }

            const { signedUrl, publicUrl, storagePath } =
              await presignedUrlResponse.json();

            const uploadResponse = await fetch(signedUrl, {
              method: "PUT",
              body: file,
              headers: { "Content-Type": file.type },
            });

            if (!uploadResponse.ok) {
              throw new Error(`Falha no upload do documento ${file.name}`);
            }

            await supabase.from("episode_documents").insert([
              {
                episode_id: episodeData.id,
                file_name: file.name,
                storage_path: storagePath,
                public_url: publicUrl,
              },
            ]);
          } catch (uploadError: any) {
            toast({
              title: "Erro no Anexo",
              description: `Falha ao enviar ${file.name}: ${uploadError.message}`,
              variant: "destructive",
            });
            // Continua para o próximo arquivo em caso de erro
          }
        }
      }

      toast({
        title: "Sucesso!",
        description: "Episódio e anexos enviados com sucesso!",
      });

      setFormData({
        title: "",
        description: "",
        categoryId: "",
        subcategoryId: "",
        publishedAt: new Date().toISOString().split("T")[0],
      });
      setAudioFile(null);
      setDocumentFiles([]);
      setSelectedTags([]);
      setSelectedCategory("");
      router.refresh();
    } catch (error: any) {
      console.error("Erro no processo de upload:", error);
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" /> Novo Episódio
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ... o resto do seu JSX do formulário permanece o mesmo ... */}
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
                <RichTextEditor
                  content={formData.description}
                  onChange={(newContent) =>
                    setFormData({ ...formData, description: newContent })
                  }
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Categoria</Label>
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
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
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
                          !selectedCategory ? "Indisponível" : "Selecione"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Tags</Label>
                <TagSelector
                  selectedTags={selectedTags}
                  onSelectedTagsChange={setSelectedTags}
                />
              </div>
              <div>
                <Label htmlFor="document-files">Documentos de Apoio</Label>
                <Input
                  id="document-files"
                  type="file"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setDocumentFiles(Array.from(e.target.files));
                    }
                  }}
                  className="mt-1"
                />
                {documentFiles.length > 0 && (
                  <div className="mt-2 text-sm text-gray-500">
                    <p>{documentFiles.length} arquivo(s) selecionado(s):</p>
                    <ul className="list-disc pl-5">
                      {documentFiles.map((file, index) => (
                        <li key={index}>{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
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
        </CardContent>
        <CardFooter className="border-t pt-6">
          <div className="w-full md:w-auto ml-auto flex flex-col md:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() =>
                toast({
                  title: "Em breve!",
                  description: "A publicação direta será implementada.",
                })
              }
            >
              Enviar e Publicar Episódio
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar Episódio"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
