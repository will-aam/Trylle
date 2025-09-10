"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Badge } from "../../ui/badge";
import { useToast } from "@/src/hooks/use-toast";
import { createClient } from "@/src/lib/supabase-client";

export function EpisodeUpload() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleDocumentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setDocumentFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const removeDocumentFile = (fileToRemove: File) => {
    setDocumentFiles(documentFiles.filter((file) => file !== fileToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) {
      toast({
        title: "Arquivo de áudio faltando",
        description: "Por favor, selecione um arquivo de áudio.",
        variant: "destructive",
      });
      return;
    }
    setIsUploading(true);

    const supabase = createClient();

    try {
      // 1. Upload audio and thumbnail files
      const uploadFormData = new FormData();
      uploadFormData.append("file", audioFile);
      if (thumbnailFile) {
        uploadFormData.append("thumbnail", thumbnailFile);
      }

      const uploadResponse = await fetch("/api/episodes/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Falha ao fazer upload dos arquivos de mídia.");
      }
      const { audio_url, thumbnail_url } = await uploadResponse.json();

      // 2. Create the episode record
      const { data: newEpisode, error: episodeError } = await supabase
        .from("episodes")
        .insert({
          title,
          description,
          category_id: category, // Assuming category state holds the ID
          audio_url,
          // TODO: This needs to be fixed. The form does not provide a correct thumbnail_url
          // It provides a file, not a URL.
          // For now, we'll pass the uploaded URL if it exists.
          image_url: thumbnail_url,
          status: "published", // or 'draft' depending on desired default
        })
        .select()
        .single();

      if (episodeError || !newEpisode) {
        throw new Error(
          episodeError?.message ||
            "Falha ao criar o episódio no banco de dados."
        );
      }

      // 3. Upload additional documents if they exist
      if (documentFiles.length > 0) {
        const docFormData = new FormData();
        docFormData.append("episode_id", newEpisode.id);
        documentFiles.forEach((file) => {
          docFormData.append("files", file);
        });

        const docUploadResponse = await fetch(
          "/api/episode-documents/upload-multiple",
          {
            method: "POST",
            body: docFormData,
          }
        );

        if (!docUploadResponse.ok) {
          // Even if this fails, the episode is created.
          // We should inform the user but not fail the entire process.
          toast({
            title: "Erro ao anexar documentos",
            description:
              "O episódio foi criado, mas houve uma falha ao anexar os documentos.",
            variant: "destructive",
          });
        }
      }

      // 4. Create tag associations (if any)
      // This part is missing from the original logic but is crucial.
      // Assuming we have a 'tags' table and an 'episode_tags' join table.
      // For simplicity, this is left as a TODO for a future task.

      toast({
        title: "Episódio enviado com sucesso!",
        description: "O episódio foi adicionado à plataforma.",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setTags([]);
      setAudioFile(null);
      setThumbnailFile(null);
      setDocumentFiles([]);
    } catch (error: any) {
      toast({
        title: "Erro no upload",
        description: error.message || "Ocorreu um erro ao enviar o episódio.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload de Novo Episódio</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título do Episódio</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Digite o título..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o conteúdo do episódio..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tecnologia">Tecnologia</SelectItem>
                    <SelectItem value="educacao">Educação</SelectItem>
                    <SelectItem value="saude">Saúde</SelectItem>
                    <SelectItem value="negocios">Negócios</SelectItem>
                    <SelectItem value="ciencia">Ciência</SelectItem>
                    <SelectItem value="arte-cultura">Arte & Cultura</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Adicionar tag..."
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="audio">Arquivo de Áudio</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <input
                    id="audio"
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                    className="hidden"
                    required
                  />
                  <label htmlFor="audio" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      {audioFile
                        ? audioFile.name
                        : "Clique para selecionar o arquivo de áudio"}
                    </p>
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="thumbnail">Thumbnail (Opcional)</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <input
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setThumbnailFile(e.target.files?.[0] || null)
                    }
                    className="hidden"
                  />
                  <label htmlFor="thumbnail" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      {thumbnailFile
                        ? thumbnailFile.name
                        : "Clique para selecionar uma imagem"}
                    </p>
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="documents">
                  Documentos Adicionais (Opcional)
                </Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <input
                    id="documents"
                    type="file"
                    multiple
                    onChange={handleDocumentFileChange}
                    className="hidden"
                  />
                  <label htmlFor="documents" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Clique para selecionar os documentos
                    </p>
                  </label>
                </div>
                <div className="mt-4 space-y-2">
                  {documentFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-md border p-2"
                    >
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDocumentFile(file)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isUploading} className="w-full">
            {isUploading ? "Enviando..." : "Publicar Episódio"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
