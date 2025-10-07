import { useState, useEffect, useRef, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/src/lib/supabase-client";
import { getTags } from "@/src/services/tagService";
import { getAudioSignedUploadUrlForCreation } from "@/src/app/admin/episodes/audioCreationActions";
import {
  getDocumentSignedUploadUrl,
  registerUploadedDocumentAction,
} from "@/src/app/admin/episodes/documentActions";
import { createEpisodeAction } from "@/src/app/admin/episodes/createEpisodeAction";
import { revalidateAdminDashboard } from "@/src/app/admin/actions";
import { Program, Category, Subcategory, Tag, Episode } from "@/src/lib/types";

export type EpisodeUploadPhase =
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

export interface UseEpisodeUploadOptions {
  autoLoadData?: boolean; // se deve carregar categorias/programas/tags ao montar
  onSuccess?: (episode: Episode) => void;
  onError?: (message: string) => void;
  onPhaseChange?: (phase: EpisodeUploadPhase) => void;
}

interface AudioSignedSuccess {
  success: true;
  signedUrl: string;
  storagePath: string;
  sanitizedFileName: string;
  publicUrl: string;
}
type AudioSignedResult =
  | AudioSignedSuccess
  | { success: false; error: string; code?: string };

interface DocSignedSuccess {
  success: true;
  signedUrl: string;
  storagePath: string;
  sanitizedFileName: string;
}
type DocSignedResult =
  | DocSignedSuccess
  | { success: false; error: string; code?: string };

function assertAudioSuccess(
  r: AudioSignedResult
): asserts r is AudioSignedSuccess {
  if (!r.success) {
    throw new Error(r.error || "Falha ao preparar upload de áudio.");
  }
}

function assertDocSuccess(r: DocSignedResult): asserts r is DocSignedSuccess {
  if (!r.success) {
    throw new Error(r.error || "Falha ao preparar upload de documento.");
  }
}

export interface EpisodeFormState {
  title: string;
  description: string;
  programId: string;
  episodeNumber: string;
  categoryId: string;
  subcategoryId: string;
  publishedAt: string; // yyyy-mm-dd
}

export interface EpisodeUploadState {
  phase: EpisodeUploadPhase;
  audioProgress: number;
  documentProgress: number;
  createdEpisodeId: string | null;
  audioDuration: number | null;
}

export interface LoadedReferenceData {
  categories: Category[];
  subcategories: Subcategory[];
  programs: Program[];
  tags: Tag[];
}

export interface UseEpisodeUploadReturn {
  // Estado de formulário
  form: EpisodeFormState;
  setForm: React.Dispatch<React.SetStateAction<EpisodeFormState>>;

  // Arquivos
  audioFile: File | null;
  setAudioFile: (f: File | null) => void;
  documentFile: File | null;
  setDocumentFile: (f: File | null) => void;

  // Metadados documento
  docPageCount: string;
  setDocPageCount: (v: string) => void;
  docReferenceCount: string;
  setDocReferenceCount: (v: string) => void;

  // Referências carregadas
  data: LoadedReferenceData;
  reloadReferenceData: () => Promise<void>;

  // Seletor de tags
  selectedTagIds: string[];
  setSelectedTagIds: React.Dispatch<React.SetStateAction<string[]>>;
  createAndSelectTag: (tag: Tag) => void;

  // Categoria / subcategoria derivadas
  selectedCategory: string;
  setSelectedCategory: (id: string) => void;
  selectedProgram: Program | null;
  setSelectedProgram: (p: Program | null) => void;
  filteredSubcategories: Subcategory[];

  // Upload & fase
  upload: EpisodeUploadState;

  // Ações
  submit: (status: "draft" | "scheduled" | "published") => Promise<void>;
  cancelAudioUpload: () => void;
  cancelDocumentUpload: () => void;
  resetAll: () => void;

  // Flags
  isBusy: boolean;

  // Helpers
  readablePhaseMessage: () => string | null;
}

export function useEpisodeUpload(
  options: UseEpisodeUploadOptions = {}
): UseEpisodeUploadReturn {
  const { autoLoadData = true, onSuccess, onError, onPhaseChange } = options;

  const supabase = createSupabaseBrowserClient();

  // Reference data
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  // Derived filtering
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const [filteredSubcategories, setFilteredSubcategories] = useState<
    Subcategory[]
  >([]);

  // Tags
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // Form
  const [form, setForm] = useState<EpisodeFormState>({
    title: "",
    description: "",
    programId: "",
    episodeNumber: "",
    categoryId: "",
    subcategoryId: "",
    publishedAt: new Date().toISOString().split("T")[0],
  });

  // Files & metadata
  const [audioFile, setAudioFileInternal] = useState<File | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [docPageCount, setDocPageCount] = useState<string>("");
  const [docReferenceCount, setDocReferenceCount] = useState<string>("");

  // Upload state
  const [phase, setPhase] = useState<EpisodeUploadPhase>("idle");
  const [audioProgress, setAudioProgress] = useState(0);
  const [documentProgress, setDocumentProgress] = useState(0);
  const [createdEpisodeId, setCreatedEpisodeId] = useState<string | null>(null);

  // XHR refs
  const audioXhrRef = useRef<XMLHttpRequest | null>(null);
  const documentXhrRef = useRef<XMLHttpRequest | null>(null);

  /* ---------------- Hooks / Effects ---------------- */

  // Carregar referencia inicial
  const reloadReferenceData = useCallback(async () => {
    const [catRes, tagRes, programRes] = await Promise.all([
      supabase.from("categories").select("*").order("name"),
      getTags(),
      supabase.from("programs").select("*, categories(*)").order("title"),
    ]);
    setCategories(catRes.data || []);
    setTags(tagRes || []);
    setPrograms(programRes.data || []);
  }, [supabase]);

  useEffect(() => {
    if (autoLoadData) {
      void reloadReferenceData();
    }
  }, [autoLoadData, reloadReferenceData]);

  // Subcategorias quando categoria muda
  useEffect(() => {
    if (selectedCategory) {
      const run = async () => {
        const { data } = await supabase
          .from("subcategories")
          .select("*")
          .eq("category_id", selectedCategory)
          .order("name");
        setSubcategories(data || []);
        setFilteredSubcategories(data || []);
      };
      void run();
    } else {
      setFilteredSubcategories([]);
    }
  }, [selectedCategory, supabase]);

  // Se programa define categoria, aplica
  useEffect(() => {
    if (selectedProgram) {
      const programCategory = categories.find(
        (c) => c.id === selectedProgram.category_id
      );
      if (programCategory) {
        setForm((prev) => ({
          ...prev,
          categoryId: programCategory.id,
          subcategoryId: "",
        }));
        setSelectedCategory(programCategory.id);
      }
    } else {
      setForm((prev) => ({
        ...prev,
        categoryId: "",
        subcategoryId: "",
      }));
      setSelectedCategory("");
    }
  }, [selectedProgram, categories]);

  // Expor callback de mudança de fase
  useEffect(() => {
    onPhaseChange?.(phase);
  }, [phase, onPhaseChange]);

  /* ---------------- Helpers / Setters ---------------- */

  const setAudioFile = (file: File | null) => {
    setAudioFileInternal(file);
    if (file) {
      if (!form.title) {
        setForm((prev) => ({
          ...prev,
          title: file.name.replace(/\.[^/.]+$/, ""),
        }));
      }
      const audio = new Audio(URL.createObjectURL(file));
      audio.onloadedmetadata = () =>
        setAudioDuration(Math.round(audio.duration));
    } else {
      setAudioDuration(null);
    }
  };

  const createAndSelectTag = (tag: Tag) => {
    setTags((prev) =>
      prev.find((t) => t.id === tag.id) ? prev : [...prev, tag]
    );
    setSelectedTagIds((prev) =>
      prev.includes(tag.id) ? prev : [...prev, tag.id]
    );
  };

  const isBusy = phase !== "idle" && phase !== "finished" && phase !== "error";

  function readablePhaseMessage(): string | null {
    switch (phase) {
      case "audio-preparing":
        return "Preparando upload de áudio...";
      case "audio-uploading":
        return `Enviando áudio: ${Math.floor(audioProgress)}%`;
      case "episode-creating":
        return "Criando episódio...";
      case "document-preparing":
        return "Preparando upload de documento...";
      case "document-uploading":
        return `Enviando documento: ${Math.floor(documentProgress)}%`;
      case "document-registering":
        return "Registrando documento...";
      case "finished":
        return "Concluído!";
      case "error":
        return "Erro no processo.";
      default:
        return null;
    }
  }

  /* ---------------- Cancelamentos ---------------- */

  const cancelAudioUpload = () => {
    if (audioXhrRef.current && phase === "audio-uploading") {
      audioXhrRef.current.abort();
      setPhase("idle");
      setAudioProgress(0);
    }
  };

  const cancelDocumentUpload = () => {
    if (
      documentXhrRef.current &&
      (phase === "document-uploading" || phase === "document-preparing")
    ) {
      documentXhrRef.current.abort();
      setPhase("audio-done");
      setDocumentProgress(0);
    }
  };

  /* ---------------- Reset ---------------- */

  const resetAll = () => {
    setForm({
      title: "",
      description: "",
      programId: "",
      episodeNumber: "",
      categoryId: "",
      subcategoryId: "",
      publishedAt: new Date().toISOString().split("T")[0],
    });
    setAudioFileInternal(null);
    setAudioDuration(null);
    setAudioProgress(0);
    setDocumentFile(null);
    setDocPageCount("");
    setDocReferenceCount("");
    setDocumentProgress(0);
    setSelectedTagIds([]);
    setSelectedCategory("");
    setSelectedProgram(null);
    setPhase("idle");
    setCreatedEpisodeId(null);
    audioXhrRef.current?.abort();
    documentXhrRef.current?.abort();
  };

  /* ---------------- Documento ---------------- */

  const uploadDocumentIfNeeded = async (episodeId: string) => {
    if (!documentFile) return;
    try {
      setPhase("document-preparing");
      const raw = (await getDocumentSignedUploadUrl(
        episodeId,
        documentFile.name
      )) as DocSignedResult;

      assertDocSuccess(raw);
      const { signedUrl, storagePath, sanitizedFileName } = raw;

      setPhase("document-uploading");
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
            reject(new Error("Falha no upload do documento."));
          }
        };
        xhr.onerror = () =>
          reject(new Error("Erro de rede no upload do documento."));
        xhr.onabort = () => reject(new Error("Upload de documento cancelado."));
        xhr.open("PUT", signedUrl, true);
        xhr.setRequestHeader(
          "Content-Type",
          documentFile.type || "application/octet-stream"
        );
        xhr.send(documentFile);
      });

      setPhase("document-registering");
      const register = await registerUploadedDocumentAction({
        episodeId,
        storagePath,
        fileName: sanitizedFileName,
        fileSize: documentFile.size,
        pageCount: docPageCount ? Number(docPageCount) : null,
        referenceCount: docReferenceCount ? Number(docReferenceCount) : null,
      });

      if (!register.success) {
        throw new Error(register.error || "Falha ao registrar documento.");
      }
    } catch (e: any) {
      // Não colocamos fase em error se falha apenas no documento — episódio já existe
      onError?.(e?.message || "Falha no upload de documento.");
    }
  };

  /* ---------------- SUBMIT (principal) ---------------- */

  const submit = async (status: "draft" | "scheduled" | "published") => {
    if (!audioFile || !form.title.trim()) {
      onError?.("Áudio e título são obrigatórios.");
      return;
    }

    try {
      // 1. Signed URL áudio
      setPhase("audio-preparing");
      const raw = (await getAudioSignedUploadUrlForCreation(
        audioFile.name
      )) as AudioSignedResult;
      assertAudioSuccess(raw);

      const {
        signedUrl: audioSignedUrl,
        publicUrl: audioPublicUrl,
        sanitizedFileName: audioFileName,
      } = raw;

      // 2. Upload áudio
      setPhase("audio-uploading");
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
            reject(new Error("Falha no upload do áudio."));
          }
        };
        xhr.onerror = () =>
          reject(new Error("Erro de rede no upload do áudio."));
        xhr.onabort = () => reject(new Error("Upload de áudio cancelado."));
        xhr.open("PUT", audioSignedUrl, true);
        xhr.setRequestHeader("Content-Type", audioFile.type);
        xhr.send(audioFile);
      });

      setPhase("audio-done");

      // 3. Criar episódio
      setPhase("episode-creating");
      const createResult = await createEpisodeAction({
        title: form.title.trim(),
        description: form.description.trim() || null,
        audio_url: audioPublicUrl,
        file_name: audioFileName,
        program_id: form.programId || null,
        episode_number: form.episodeNumber ? Number(form.episodeNumber) : null,
        category_id: form.categoryId || null,
        subcategory_id: form.subcategoryId || null,
        published_at: new Date(form.publishedAt).toISOString(),
        status,
        duration_in_seconds: audioDuration ?? null,
        tagIds: selectedTagIds,
      });

      if (!createResult.success) {
        throw new Error(createResult.error || "Falha ao criar episódio.");
      }

      const epId = createResult.episode.id;
      setCreatedEpisodeId(epId);

      // 4. Documento (opcional)
      if (documentFile) {
        await uploadDocumentIfNeeded(epId);
      }

      setPhase("finished");
      revalidateAdminDashboard();
      onSuccess?.(createResult.episode);
    } catch (e: any) {
      setPhase("error");
      onError?.(e?.message || "Erro inesperado no fluxo de upload.");
    }
  };

  return {
    form,
    setForm,
    audioFile,
    setAudioFile,
    documentFile,
    setDocumentFile,
    docPageCount,
    setDocPageCount,
    docReferenceCount,
    setDocReferenceCount,
    data: {
      categories,
      subcategories,
      programs,
      tags,
    },
    reloadReferenceData,
    selectedTagIds,
    setSelectedTagIds,
    createAndSelectTag,
    selectedCategory,
    setSelectedCategory,
    selectedProgram,
    setSelectedProgram,
    filteredSubcategories,
    upload: {
      phase,
      audioProgress,
      documentProgress,
      createdEpisodeId,
      audioDuration,
    },
    submit,
    cancelAudioUpload,
    cancelDocumentUpload,
    resetAll,
    isBusy,
    readablePhaseMessage,
  };
}
