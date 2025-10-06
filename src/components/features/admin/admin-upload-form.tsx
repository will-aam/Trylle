"use client";

import { useState, useEffect, useCallback } from "react";
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
import { TagSelector } from "../admin/TagSelector";
import { cn } from "@/src/lib/utils";
import { revalidateAdminDashboard } from "@/src/app/admin/actions";
import { getTags } from "@/src/services/tagService";
import { createEpisodeAction } from "@/src/app/admin/episodes/createEpisodeAction";
import {
  uploadDocumentAction,
  UploadDocumentResult,
} from "@/src/app/admin/episodes/documentActions";

interface FormState {
  title: string;
  description: string;
  programId: string;
  episodeNumber: string;
  categoryId: string;
  subcategoryId: string;
  publishedAt: string; // yyyy-mm-dd
}

export function UploadForm() {
  const supabase = createSupabaseBrowserClient();
  const { toast } = useToast();
  const router = useRouter();

  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success"
  >("idle");
  const [formKey, setFormKey] = useState(Date.now());

  // Dados carregados
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  // Estados do formulário
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  // Áudio
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);

  // Documento (apenas um)
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [docPageCount, setDocPageCount] = useState<string>("");
  const [docReferenceCount, setDocReferenceCount] = useState<string>("");

  const [formData, setFormData] = useState<FormState>({
    title: "",
    description: "",
    programId: "",
    episodeNumber: "",
    categoryId: "",
    subcategoryId: "",
    publishedAt: new Date().toISOString().split("T")[0],
  });

  /* --------- Carregar dados iniciais --------- */
  useEffect(() => {
    const loadInitialData = async () => {
      const [catRes, tagRes, programRes] = await Promise.all([
        supabase.from("categories").select("*").order("name"),
        getTags(), // deve retornar Tag[]
        supabase.from("programs").select("*, categories(*)").order("title"),
      ]);

      setCategories(catRes.data || []);
      setAllTags(tagRes || []);
      setPrograms(programRes.data || []);
    };
    loadInitialData();
  }, [supabase, formKey]);

  /* --------- Carregar subcategorias ao mudar categoria --------- */
  useEffect(() => {
    if (selectedCategory) {
      const run = async () => {
        const { data } = await supabase
          .from("subcategories")
          .select("*")
          .eq("category_id", selectedCategory)
          .order("name");
        setSubcategories(data || []);
      };
      run();
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory, supabase, formKey]);

  /* --------- Preencher categoria a partir do programa --------- */
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
      setFormData((prev) => ({
        ...prev,
        categoryId: "",
        subcategoryId: "",
      }));
      setSelectedCategory("");
    }
  }, [selectedProgram, categories]);

  /* --------- Handler de arquivo de áudio --------- */
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (!file.type.startsWith("audio/")) {
        toast({
          title: "Arquivo inválido",
          description: "Selecione um arquivo de áudio válido.",
          variant: "destructive",
        });
        setAudioFile(null);
        setAudioDuration(null);
        return;
      }
      setAudioFile(file);
      if (!formData.title) {
        setFormData((prev) => ({
          ...prev,
          title: file.name.replace(/\.[^/.]+$/, ""),
        }));
      }
      const audio = new Audio(URL.createObjectURL(file));
      audio.onloadedmetadata = () => {
        setAudioDuration(Math.round(audio.duration));
      };
    } else {
      setAudioFile(null);
      setAudioDuration(null);
    }
  };

  /* --------- Handler de documento --------- */
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Você pode validar extensão aqui também se quiser (pdf/doc/docx)
      setDocumentFile(file);
    } else {
      setDocumentFile(null);
      setDocPageCount("");
      setDocReferenceCount("");
    }
  };

  /* --------- Reset do formulário --------- */
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
    setDocumentFile(null);
    setDocPageCount("");
    setDocReferenceCount("");
    setSelectedTagIds([]);
    setSelectedCategory("");
    setSelectedProgram(null);
    setFormKey(Date.now());
  };

  /* --------- Criação de tag a partir do TagSelector --------- */
  const handleCreateTag = useCallback((newTag: Tag) => {
    setAllTags((prev) =>
      prev.some((t) => t.id === newTag.id) ? prev : [...prev, newTag]
    );
  }, []);

  /* --------- Helper de tamanho legível --------- */
  const readableSizeMB = (bytes: number) =>
    (bytes / (1024 * 1024)).toFixed(2) + " MB";

  /* --------- Submit principal --------- */
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
      // 1. Obter URL pré-assinada (upload do áudio)
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

      // 2. Upload binário do áudio
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        body: audioFile,
        headers: { "Content-Type": audioFile.type },
      });

      if (!uploadResponse.ok) {
        throw new Error("Falha no upload do arquivo de áudio.");
      }

      // 3. Cria episódio via server action
      const result = await createEpisodeAction({
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        audio_url: publicUrl,
        file_name: originalFileName,
        program_id: formData.programId || null,
        episode_number: formData.episodeNumber
          ? Number(formData.episodeNumber)
          : null,
        category_id: formData.categoryId || null,
        subcategory_id: formData.subcategoryId || null,
        published_at: new Date(formData.publishedAt).toISOString(),
        status,
        duration_in_seconds: audioDuration ?? null,
        tagIds: selectedTagIds,
      });

      if (!result.success) {
        throw new Error(result.error || "Falha ao criar episódio.");
      }

      const newEpisodeId = result.episode.id;

      // 4. Se há documento selecionado, envia agora
      if (documentFile) {
        const docForm = new FormData();
        docForm.append("file", documentFile);
        if (docPageCount.trim()) docForm.append("page_count", docPageCount);
        if (docReferenceCount.trim())
          docForm.append("reference_count", docReferenceCount);

        const docUpload: UploadDocumentResult = await uploadDocumentAction(
          newEpisodeId,
          docForm
        );

        if (!docUpload.success) {
          // Não dá rollback no episódio; apenas avisa
          toast({
            title: "Documento não anexado",
            description:
              docUpload.error ||
              "O episódio foi criado, mas o documento falhou.",
            variant: "destructive",
          });
        }
      }

      // 5. Finaliza UI
      setUploadStatus("success");
      toast({
        title: "Sucesso!",
        description: "Episódio criado com sucesso.",
      });

      revalidateAdminDashboard();
      resetForm();
      router.refresh();

      setTimeout(() => {
        setUploadStatus("idle");
      }, 2500);
    } catch (error: any) {
      console.error("Erro no processo de upload:", error);
      toast({
        title: "Erro no upload",
        description: error.message || "Falha inesperada.",
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
            {/* Coluna Esquerda */}
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
              <div>
                <Label>Tags</Label>
                <TagSelector
                  allTags={allTags}
                  value={selectedTagIds}
                  onChange={setSelectedTagIds}
                  onCreateTag={handleCreateTag}
                  placeholder="Selecione ou crie tags..."
                />
              </div>
            </div>

            {/* Coluna Direita */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="audio-file">Arquivo de Áudio *</Label>
                <Input
                  id="audio-file"
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioChange}
                  className="mt-1"
                />
                {audioFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {audioFile.name}{" "}
                    {audioDuration != null &&
                      `(${Math.floor(audioDuration / 60)}:${String(
                        audioDuration % 60
                      ).padStart(2, "0")})`}
                  </p>
                )}
              </div>

              {/* Programa / Nº Episódio */}
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
                        const prog =
                          programs.find((p) => p.id === value) || null;
                        setSelectedProgram(prog);
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

              {/* Categoria / Subcategoria */}
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
                    disabled={!!selectedProgram}
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

              {/* Documento Único */}
              <div className="space-y-2">
                <Label htmlFor="document-file">
                  Documento de Apoio (único)
                </Label>
                <Input
                  id="document-file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleDocumentChange}
                  className="mt-1"
                />
                {documentFile && (
                  <div className="mt-2 space-y-2 rounded-md border p-3">
                    <div className="text-sm font-medium truncate">
                      {documentFile.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Tamanho: {readableSizeMB(documentFile.size)} (
                      {documentFile.size} bytes)
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label className="text-xs font-medium">
                          Nº de Páginas (opcional)
                        </label>
                        <Input
                          type="number"
                          min={0}
                          value={docPageCount}
                          onChange={(e) => setDocPageCount(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-medium">
                          Nº de Referências (opcional)
                        </label>
                        <Input
                          type="number"
                          min={0}
                          value={docReferenceCount}
                          onChange={(e) => setDocReferenceCount(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDocumentFile(null);
                          setDocPageCount("");
                          setDocReferenceCount("");
                        }}
                      >
                        Remover documento
                      </Button>
                    </div>
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
