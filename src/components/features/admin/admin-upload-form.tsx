"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { Upload, CheckCircle, StopCircle, Music, FileText } from "lucide-react";
import { createSupabaseBrowserClient } from "@/src/lib/supabase-client";
import { Program, Category, Subcategory, Tag } from "@/src/lib/types";
import { TagSelector } from "../admin/TagSelector";
import { cn } from "@/src/lib/utils";
import { revalidateAdminDashboard } from "@/src/app/admin/actions";
import { getTags } from "@/src/services/tagService";
import { createEpisodeAction } from "@/src/app/admin/episodes/createEpisodeAction";
import {
  getDocumentSignedUploadUrl,
  registerUploadedDocumentAction,
} from "@/src/app/admin/episodes/documentActions";
import { getAudioSignedUploadUrlForCreation } from "@/src/app/admin/episodes/audioCreationActions";

interface FormState {
  title: string;
  description: string;
  programId: string;
  episodeNumber: string;
  categoryId: string;
  subcategoryId: string;
  publishedAt: string;
}

type UploadPhase =
  | "idle"
  | "audio-preparing"
  | "audio-uploading"
  | "audio-done"
  | "episode-creating"
  | "document-preparing"
  | "document-uploading"
  | "document-registering"
  | "finished"
  | "error";

// Type guards para signed URL results
type AudioSignedSuccess = {
  success: true;
  signedUrl: string;
  storagePath: string;
  sanitizedFileName: string;
  publicUrl: string;
};
type AudioSignedResult =
  | AudioSignedSuccess
  | { success: false; error: string; code?: string };

type DocSignedSuccess = {
  success: true;
  signedUrl: string;
  storagePath: string;
  sanitizedFileName: string;
};
type DocSignedResult =
  | DocSignedSuccess
  | { success: false; error: string; code?: string };

function assertAudioSuccess(
  r: AudioSignedResult
): asserts r is AudioSignedSuccess {
  if (!r.success) {
    throw new Error(r.error || "Falha ao gerar signed URL de áudio.");
  }
}

function assertDocSuccess(r: DocSignedResult): asserts r is DocSignedSuccess {
  if (!r.success) {
    throw new Error(r.error || "Falha ao gerar signed URL de documento.");
  }
}

export function UploadForm() {
  const supabase = createSupabaseBrowserClient();
  const { toast } = useToast();
  const router = useRouter();

  const [formKey, setFormKey] = useState(Date.now());
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>("idle");

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
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const audioXhrRef = useRef<XMLHttpRequest | null>(null);

  // Documento
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [docPageCount, setDocPageCount] = useState<string>("");
  const [docReferenceCount, setDocReferenceCount] = useState<string>("");
  const [documentProgress, setDocumentProgress] = useState<number>(0);
  const documentXhrRef = useRef<XMLHttpRequest | null>(null);

  // ID do episódio criado
  const [createdEpisodeId, setCreatedEpisodeId] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormState>({
    title: "",
    description: "",
    programId: "",
    episodeNumber: "",
    categoryId: "",
    subcategoryId: "",
    publishedAt: new Date().toISOString().split("T")[0],
  });

  /* ---------------- Carregar dados iniciais ---------------- */
  useEffect(() => {
    const loadInitialData = async () => {
      const [catRes, tagRes, programRes] = await Promise.all([
        supabase.from("categories").select("*").order("name"),
        getTags(),
        supabase.from("programs").select("*, categories(*)").order("title"),
      ]);

      setCategories(catRes.data || []);
      setAllTags(tagRes || []);
      setPrograms(programRes.data || []);
    };
    loadInitialData();
  }, [supabase, formKey]);

  /* ---------------- Subcategorias ---------------- */
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
      void run();
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory, supabase, formKey]);

  /* ---------------- Programa define categoria ---------------- */
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

  /* ---------------- Áudio ---------------- */
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

  /* ---------------- Documento ---------------- */
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setDocumentFile(null);
      setDocPageCount("");
      setDocReferenceCount("");
      return;
    }
    const allowed = [".pdf", ".doc", ".docx"];
    const lower = file.name.toLowerCase();
    if (!allowed.some((ext) => lower.endsWith(ext))) {
      toast({
        title: "Formato inválido",
        description: `Use: ${allowed.join(", ")}`,
        variant: "destructive",
      });
      return;
    }
    setDocumentFile(file);
  };

  /* ---------------- Reset completo ---------------- */
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
    setAudioProgress(0);
    setDocumentFile(null);
    setDocPageCount("");
    setDocReferenceCount("");
    setDocumentProgress(0);
    setSelectedTagIds([]);
    setSelectedCategory("");
    setSelectedProgram(null);
    setUploadPhase("idle");
    setCreatedEpisodeId(null);
    setFormKey(Date.now());
    audioXhrRef.current?.abort();
    documentXhrRef.current?.abort();
  };

  /* ---------------- Criar tag ---------------- */
  const handleCreateTag = useCallback((newTag: Tag) => {
    setAllTags((prev) =>
      prev.some((t) => t.id === newTag.id) ? prev : [...prev, newTag]
    );
  }, []);

  /* ---------------- Upload Documento (após criar episódio) ---------------- */
  const performDocumentUpload = async (episodeId: string) => {
    if (!documentFile) return;
    try {
      setUploadPhase("document-preparing");

      const raw = (await getDocumentSignedUploadUrl(
        episodeId,
        documentFile.name
      )) as DocSignedResult;

      try {
        assertDocSuccess(raw);
      } catch (err: any) {
        setUploadPhase("error");
        toast({
          title: "Falha ao preparar documento",
          description: err?.message || "Erro desconhecido.",
          variant: "destructive",
        });
        return;
      }

      const { signedUrl, storagePath, sanitizedFileName } = raw;

      setUploadPhase("document-uploading");
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        documentXhrRef.current = xhr;
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            setDocumentProgress((evt.loaded / evt.total) * 100);
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setDocumentProgress(100);
            resolve();
          } else {
            reject(new Error(`Status HTTP ${xhr.status}`));
          }
        };
        xhr.onerror = () =>
          reject(new Error("Falha de rede no upload do documento."));
        xhr.onabort = () => reject(new Error("Upload de documento cancelado."));
        xhr.open("PUT", signedUrl, true);
        xhr.setRequestHeader(
          "Content-Type",
          documentFile.type || "application/octet-stream"
        );
        xhr.send(documentFile);
      });

      setUploadPhase("document-registering");
      const register = await registerUploadedDocumentAction({
        episodeId,
        storagePath,
        fileName: sanitizedFileName,
        fileSize: documentFile.size,
        pageCount: docPageCount ? Number(docPageCount) : null,
        referenceCount: docReferenceCount ? Number(docReferenceCount) : null,
      });

      if (!register.success) {
        setUploadPhase("error");
        toast({
          title: "Falha ao registrar documento",
          description: register.error || "Erro desconhecido.",
          variant: "destructive",
        });
        return;
      }
    } catch (e: any) {
      toast({
        title: "Erro no documento",
        description: e?.message || "Falha durante upload.",
        variant: "destructive",
      });
      // Não transiciona para error global para não invalidar episódio criado
    }
  };

  const cancelDocumentUpload = () => {
    if (
      documentXhrRef.current &&
      (uploadPhase === "document-uploading" ||
        uploadPhase === "document-preparing")
    ) {
      documentXhrRef.current.abort();
      toast({ description: "Upload de documento cancelado." });
      setUploadPhase("audio-done");
      setDocumentProgress(0);
    }
  };

  /* ---------------- Fluxo principal ---------------- */
  const handleSubmit = async (status: "draft" | "scheduled" | "published") => {
    if (!audioFile || !formData.title.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Áudio e Título são necessários.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadPhase("audio-preparing");
      const raw = (await getAudioSignedUploadUrlForCreation(
        audioFile.name
      )) as AudioSignedResult;

      try {
        assertAudioSuccess(raw);
      } catch (err: any) {
        setUploadPhase("error");
        toast({
          title: "Falha ao preparar upload de áudio",
          description: err?.message || "Erro desconhecido.",
          variant: "destructive",
        });
        return;
      }

      const {
        signedUrl: audioSignedUrl,
        publicUrl: audioPublicUrl,
        sanitizedFileName: audioFileName,
      } = raw;

      setUploadPhase("audio-uploading");
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        audioXhrRef.current = xhr;
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            setAudioProgress((evt.loaded / evt.total) * 100);
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setAudioProgress(100);
            resolve();
          } else {
            reject(new Error(`Status HTTP ${xhr.status}`));
          }
        };
        xhr.onerror = () =>
          reject(new Error("Falha de rede durante upload do áudio."));
        xhr.onabort = () => reject(new Error("Upload de áudio cancelado."));
        xhr.open("PUT", audioSignedUrl, true);
        xhr.setRequestHeader("Content-Type", audioFile.type);
        xhr.send(audioFile);
      });

      setUploadPhase("audio-done");

      setUploadPhase("episode-creating");
      const createResult = await createEpisodeAction({
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        audio_url: audioPublicUrl,
        file_name: audioFileName,
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

      if (!createResult.success) {
        setUploadPhase("error");
        toast({
          title: "Falha ao criar episódio",
          description: createResult.error || "Erro desconhecido.",
          variant: "destructive",
        });
        return;
      }

      const epId = createResult.episode.id;
      setCreatedEpisodeId(epId);

      if (documentFile) {
        await performDocumentUpload(epId);
      }

      setUploadPhase("finished");
      toast({
        title: "Sucesso!",
        description: "Episódio criado com sucesso.",
      });
      revalidateAdminDashboard();
      resetForm();
      router.refresh();
    } catch (e: any) {
      setUploadPhase("error");
      toast({
        title: "Erro no processo",
        description: e?.message || "Falha inesperada.",
        variant: "destructive",
      });
    }
  };

  const isBusy =
    uploadPhase !== "idle" &&
    uploadPhase !== "finished" &&
    uploadPhase !== "error";

  const cancelAudioUpload = () => {
    if (audioXhrRef.current && uploadPhase === "audio-uploading") {
      audioXhrRef.current.abort();
      toast({ description: "Upload de áudio cancelado." });
      setUploadPhase("idle");
      setAudioProgress(0);
    }
  };

  /* ---------------- Mensagens auxiliares ---------------- */
  const renderAudioPhaseMessage = () => {
    switch (uploadPhase) {
      case "audio-preparing":
        return "Preparando upload...";
      case "audio-uploading":
        return `Enviando áudio: ${Math.floor(audioProgress)}%`;
      case "episode-creating":
        return "Criando episódio...";
      case "document-preparing":
      case "document-uploading":
        return "Processo de documento em andamento...";
      case "document-registering":
        return "Registrando documento...";
      case "finished":
        return "Concluído!";
      case "error":
        return "Ocorreu um erro.";
      default:
        return null;
    }
  };

  const renderDocumentPhaseMessage = () => {
    switch (uploadPhase) {
      case "document-preparing":
        return "Preparando...";
      case "document-uploading":
        return `Enviando doc: ${Math.floor(documentProgress)}%`;
      case "document-registering":
        return "Registrando...";
      case "finished":
        return "Concluído.";
      default:
        return null;
    }
  };

  /* ---------------- JSX ---------------- */
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
                  disabled={isBusy}
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
              {/* Áudio */}
              <div className="space-y-2">
                <Label>Arquivo de Áudio *</Label>
                <div className="rounded-md border p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <Music className="h-5 w-5 text-muted-foreground" />
                      <div className="truncate text-sm">
                        {audioFile
                          ? audioFile.name
                          : "Nenhum arquivo selecionado"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        id="audio-file"
                        disabled={isBusy}
                        onChange={handleAudioChange}
                      />
                      {!audioFile && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isBusy}
                          onClick={() =>
                            document.getElementById("audio-file")?.click()
                          }
                        >
                          Selecionar
                        </Button>
                      )}
                    </div>
                  </div>

                  {audioFile && (
                    <>
                      {uploadPhase === "audio-uploading" && (
                        <div>
                          <div className="w-full h-2 rounded bg-muted overflow-hidden mb-1">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{
                                width: `${Math.min(audioProgress, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {renderAudioPhaseMessage() && (
                        <div className="text-[11px] text-muted-foreground">
                          {renderAudioPhaseMessage()}
                        </div>
                      )}

                      {uploadPhase === "audio-uploading" ? (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={cancelAudioUpload}
                        >
                          <StopCircle className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                      ) : audioFile ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isBusy}
                          onClick={() => {
                            setAudioFile(null);
                            setAudioProgress(0);
                          }}
                        >
                          Remover seleção
                        </Button>
                      ) : null}

                      {audioFile && audioDuration != null && (
                        <p className="text-xs text-muted-foreground">
                          Duração: {Math.floor(audioDuration / 60)}:
                          {String(audioDuration % 60).padStart(2, "0")}
                        </p>
                      )}
                    </>
                  )}
                </div>
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
                    disabled={isBusy}
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
                    disabled={!formData.programId || isBusy}
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
                    disabled={!!selectedProgram || isBusy}
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
                    disabled={
                      !selectedCategory || subcategories.length === 0 || isBusy
                    }
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

              {/* Documento */}
              <div className="space-y-2">
                <Label htmlFor="document-file">Documento de Apoio</Label>
                <div className="rounded-md border p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div className="truncate text-sm">
                        {documentFile
                          ? documentFile.name
                          : "Nenhum documento selecionado"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        id="document-file"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={handleDocumentChange}
                        disabled={
                          isBusy &&
                          !(
                            uploadPhase === "audio-done" ||
                            uploadPhase === "document-preparing" ||
                            uploadPhase === "document-uploading" ||
                            uploadPhase === "document-registering" ||
                            uploadPhase === "finished"
                          )
                        }
                      />
                      {!documentFile && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={
                            uploadPhase !== "idle" &&
                            uploadPhase !== "audio-done"
                          }
                          onClick={() =>
                            document.getElementById("document-file")?.click()
                          }
                        >
                          Selecionar
                        </Button>
                      )}
                    </div>
                  </div>

                  {documentFile && (
                    <>
                      {(uploadPhase === "document-uploading" ||
                        uploadPhase === "document-registering" ||
                        documentProgress > 0) && (
                        <div>
                          <div className="w-full h-2 rounded bg-muted overflow-hidden mb-1">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{
                                width: `${
                                  uploadPhase === "document-registering"
                                    ? 100
                                    : Math.min(documentProgress, 100)
                                }%`,
                              }}
                            />
                          </div>
                          {renderDocumentPhaseMessage() && (
                            <div className="text-[11px] text-muted-foreground">
                              {renderDocumentPhaseMessage()}
                            </div>
                          )}
                        </div>
                      )}

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
                            disabled={
                              !(
                                uploadPhase === "idle" ||
                                uploadPhase === "audio-done"
                              )
                            }
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
                            onChange={(e) =>
                              setDocReferenceCount(e.target.value)
                            }
                            disabled={
                              !(
                                uploadPhase === "idle" ||
                                uploadPhase === "audio-done"
                              )
                            }
                          />
                        </div>
                      </div>

                      {uploadPhase === "document-uploading" ? (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={cancelDocumentUpload}
                        >
                          <StopCircle className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={
                            isBusy &&
                            uploadPhase !== "audio-done" &&
                            uploadPhase !== "finished"
                          }
                          onClick={() => {
                            setDocumentFile(null);
                            setDocPageCount("");
                            setDocReferenceCount("");
                            setDocumentProgress(0);
                          }}
                        >
                          Remover seleção
                        </Button>
                      )}

                      {createdEpisodeId &&
                        uploadPhase === "audio-done" &&
                        documentFile && (
                          <p className="text-[11px] text-muted-foreground">
                            O documento será enviado automaticamente durante o
                            fluxo de criação.
                          </p>
                        )}
                    </>
                  )}
                </div>
              </div>

              {/* Publicação */}
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
                  disabled={isBusy}
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
              disabled={isBusy || !audioFile || !formData.title.trim()}
            >
              {uploadPhase === "idle" && "Criar rascunho"}
              {uploadPhase === "audio-preparing" && "Preparando..."}
              {uploadPhase === "audio-uploading" && "Enviando áudio..."}
              {uploadPhase === "episode-creating" && "Criando..."}
              {uploadPhase === "document-preparing" && "Prep. doc..."}
              {uploadPhase === "document-uploading" &&
                `Doc ${Math.floor(documentProgress)}%`}
              {uploadPhase === "document-registering" && "Registrando doc..."}
              {uploadPhase === "finished" && (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" /> Feito
                </>
              )}
              {uploadPhase === "error" && "Tentar novamente"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleSubmit("scheduled")}
              disabled={isBusy || !audioFile || !formData.title.trim()}
            >
              {uploadPhase === "idle" && "Agendar"}
              {uploadPhase !== "idle" &&
                uploadPhase !== "finished" &&
                "Processando..."}
              {uploadPhase === "finished" && (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" /> Sucesso
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={() => handleSubmit("published")}
              disabled={isBusy || !audioFile || !formData.title.trim()}
              className={cn({
                "bg-green-600 hover:bg-green-700": uploadPhase === "finished",
              })}
            >
              {uploadPhase === "idle" && "Publicar"}
              {uploadPhase === "audio-preparing" && "Preparando..."}
              {uploadPhase === "audio-uploading" &&
                `Áudio ${Math.floor(audioProgress)}%`}
              {uploadPhase === "episode-creating" && "Criando episódio..."}
              {uploadPhase === "document-preparing" && "Prep. doc..."}
              {uploadPhase === "document-uploading" &&
                `Doc ${Math.floor(documentProgress)}%`}
              {uploadPhase === "document-registering" && "Finalizando..."}
              {uploadPhase === "finished" && (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" /> Sucesso!
                </>
              )}
              {uploadPhase === "error" && "Tentar novamente"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
