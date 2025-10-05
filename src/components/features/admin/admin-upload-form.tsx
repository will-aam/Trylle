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
import { Upload, CheckCircle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/src/lib/supabase-client";
import { Program, Category, Subcategory, Tag } from "@/src/lib/types";
import { TagSelector } from "./TagSelector";
import { cn } from "@/src/lib/utils";
import { revalidateAdminDashboard } from "@/src/app/admin/actions";
import { getTags } from "@/src/services/tagService";

export function UploadForm() {
  const supabase = createSupabaseBrowserClient();
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success"
  >("idle");
  const [formKey, setFormKey] = useState(Date.now());

  // States para os dados
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  // States para controle do formulário
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [pageCount, setPageCount] = useState<string>("");
  const [referenceCount, setReferenceCount] = useState<string>("");
  const [fileSize, setFileSize] = useState<number | null>(null);

  const { toast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    programId: "",
    episodeNumber: "",
    categoryId: "",
    subcategoryId: "",
    publishedAt: new Date().toISOString().split("T")[0],
  });

  // Carrega dados iniciais (Categorias, Tags, Programas)
  useEffect(() => {
    const loadInitialData = async () => {
      const [catData, tagsData, programsData] = await Promise.all([
        supabase.from("categories").select("*").order("name"),
        getTags(),
        supabase.from("programs").select("*, categories(*)").order("title"),
      ]);

      setCategories(catData.data || []);
      setTags(tagsData || []);
      setPrograms(programsData.data || []);
    };
    loadInitialData();
  }, [supabase, formKey]);

  // Carrega subcategorias quando uma categoria é selecionada
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
  }, [selectedCategory, supabase, formKey]);

  // Preenche a categoria automaticamente ao selecionar um programa
  useEffect(() => {
    if (selectedProgram) {
      const programCategory = categories.find(
        (c) => c.id === selectedProgram.category_id
      );
      if (programCategory) {
        setFormData((prev) => ({
          ...prev,
          categoryId: programCategory.id,
          subcategoryId: "",
        }));
        setSelectedCategory(programCategory.id);
      }
    } else {
      // Opcional: Limpar a categoria se o programa for desmarcado
      setFormData((prev) => ({ ...prev, categoryId: "", subcategoryId: "" }));
      setSelectedCategory("");
    }
  }, [selectedProgram, categories]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("audio/")) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione um arquivo de áudio.",
          variant: "destructive",
        });
        setAudioFile(null);
        setAudioDuration(null);
        return;
      }
      setAudioFile(file);
      if (!formData.title) {
        setFormData({ ...formData, title: file.name.replace(/\.[^/.]+$/, "") });
      }

      const audio = new Audio(URL.createObjectURL(file));
      audio.onloadedmetadata = () => {
        setAudioDuration(Math.round(audio.duration));
      };
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      programId: "",
      episodeNumber: "",
      categoryId: "",
      subcategoryId: "",
      publishedAt: new Date().toISOString().split("T")[0],
    });
    setAudioFile(null);
    setAudioDuration(null);
    setDocumentFiles([]);
    setPageCount("");
    setReferenceCount("");
    setFileSize(null);
    setSelectedTags([]);
    setSelectedCategory("");
    setSelectedProgram(null);
    setFormKey(Date.now());
  };

  const handleSubmit = async (status: "draft" | "scheduled" | "published") => {
    if (!audioFile || !formData.title.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Áudio e Título são necessários.",
        variant: "destructive",
      });
      return;
    }
    setUploadStatus("uploading");

    try {
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

      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        body: audioFile,
        headers: { "Content-Type": audioFile.type },
      });

      if (!uploadResponse.ok) {
        throw new Error("Falha no upload do arquivo para o armazenamento.");
      }

      const { data: episodeData, error: insertError } = await supabase
        .from("episodes")
        .insert([
          {
            title: formData.title.trim(),
            description: formData.description.trim() || null,
            audio_url: publicUrl,
            file_name: originalFileName,
            program_id: formData.programId || null,
            episode_number: formData.episodeNumber
              ? parseInt(formData.episodeNumber, 10)
              : null,
            category_id: formData.categoryId || null,
            subcategory_id: formData.subcategoryId || null,
            published_at: new Date(formData.publishedAt).toISOString(),
            duration_in_seconds: audioDuration,
            status: status,
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

      // ... (lógica de upload de documentos permanece a mesma)

      setUploadStatus("success");
      toast({
        title: "Sucesso!",
        description: "Episódio e anexos enviados com sucesso!",
      });
      revalidateAdminDashboard();
      resetForm();
      router.refresh();

      setTimeout(() => {
        setUploadStatus("idle");
      }, 3000);
    } catch (error: any) {
      console.error("Erro no processo de upload:", error);
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
      setUploadStatus("idle");
    }
  };

  return (
    <form key={formKey} className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" /> Novo Episódio
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto p-6">
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
                    Arquivo: {audioFile.name}{" "}
                    {audioDuration &&
                      `(${Math.floor(audioDuration / 60)}:${String(
                        audioDuration % 60
                      ).padStart(2, "0")})`}
                  </p>
                )}
              </div>

              {/* Seção de Programa e Número do Episódio */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Programa</Label>
                  <Select
                    value={formData.programId}
                    onValueChange={(value) => {
                      if (value === "nenhum") {
                        setSelectedProgram(null);
                        setFormData({ ...formData, programId: "" });
                      } else {
                        const program = programs.find((p) => p.id === value);
                        setSelectedProgram(program || null);
                        setFormData({ ...formData, programId: value });
                      }
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione um programa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nenhum">Nenhum</SelectItem>
                      {programs.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="episode-number">Nº do Episódio</Label>
                  <Input
                    id="episode-number"
                    type="number"
                    value={formData.episodeNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        episodeNumber: e.target.value,
                      })
                    }
                    placeholder="Ex: 1"
                    className="mt-1"
                    disabled={!formData.programId}
                  />
                </div>
              </div>

              {/* Seção de Categoria e Subcategoria */}
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
                    disabled={!!selectedProgram} // Desabilitado se um programa foi selecionado
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
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
                        <SelectItem key={s.id} value={String(s.id)}>
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
                  tags={tags}
                />
              </div>
              <div>
                <Label htmlFor="document-files">Documentos de Apoio</Label>
                <Input
                  id="document-files"
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files) {
                      const fileArray = Array.from(files);
                      setDocumentFiles(fileArray);
                      if (fileArray.length > 0) {
                        setFileSize(fileArray[0].size);
                      } else {
                        setFileSize(null);
                      }
                    }
                  }}
                  className="mt-1"
                />
                {/* ... (lógica de exibição de documentos) */}
              </div>

              {/* ... (campos de documentos e data de publicação) ... */}
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
              onClick={() => handleSubmit("draft")}
              disabled={uploadStatus !== "idle"}
            >
              Criar rascunho
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleSubmit("scheduled")}
              disabled={uploadStatus !== "idle"}
            >
              Agendar
            </Button>
            <Button
              type="button"
              onClick={() => handleSubmit("published")}
              disabled={uploadStatus !== "idle"}
              className={cn({
                "bg-green-600 hover:bg-green-700": uploadStatus === "success",
              })}
            >
              {uploadStatus === "uploading" && "Enviando..."}
              {uploadStatus === "success" && (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" /> Sucesso!
                </>
              )}
              {uploadStatus === "idle" && "Publicar"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
