import { useState, useEffect, useRef, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/src/lib/supabase-client";
import { getTags } from "@/src/services/tagService";
import { getAudioSignedUploadUrlForCreation } from "@/src/app/admin/episodes/audioCreationActions";
import {
  getDocumentSignedUploadUrl,
  registerUploadedDocumentAction,
} from "@/src/app/admin/episodes/documentActions";
import { createEpisodeAction } from "@/src/app/admin/episodes/actions";
import { revalidateAdminDashboard } from "@/src/app/admin/actions";
import { Program, Category, Subcategory, Tag, Episode } from "@/src/lib/types";

import {
  normalizeUploadError,
  validateFileType,
  validateFileSize,
  buildUserMessage,
  type NormalizedUploadError,
} from "@/src/lib/upload/errors";

/* --------------------------------------------------
 * Types
 * -------------------------------------------------- */

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

export interface UseEpisodeUploadOptions {
  autoLoadData?: boolean;
  onSuccess?: (episode: Episode) => void;
  onError?: (message: string, err?: NormalizedUploadError) => void;
  onPhaseChange?: (phase: EpisodeUploadPhase) => void;
  audioMaxMB?: number;
  documentMaxMB?: number;
  audioAllowedExt?: string[];
  documentAllowedExt?: string[];
}

export interface UseEpisodeUploadReturn {
  form: EpisodeFormState;
  setForm: React.Dispatch<React.SetStateAction<EpisodeFormState>>;

  audioFile: File | null;
  setAudioFile: (f: File | null) => void;
  documentFile: File | null;
  setDocumentFile: (f: File | null) => void;

  docPageCount: string;
  setDocPageCount: (v: string) => void;
  docReferenceCount: string;
  setDocReferenceCount: (v: string) => void;

  data: LoadedReferenceData;
  reloadReferenceData: () => Promise<void>;

  selectedTagIds: string[];
  setSelectedTagIds: React.Dispatch<React.SetStateAction<string[]>>;
  createAndSelectTag: (tag: Tag) => void;

  selectedCategory: string;
  setSelectedCategory: (id: string) => void;
  selectedProgram: Program | null;
  setSelectedProgram: (p: Program | null) => void;
  filteredSubcategories: Subcategory[];

  upload: EpisodeUploadState;

  submit: (status: "draft" | "scheduled" | "published") => Promise<void>;
  cancelAudioUpload: () => void;
  cancelDocumentUpload: () => void;
  resetAll: () => void;

  lastError: NormalizedUploadError | null;
  isBusy: boolean;

  readablePhaseMessage: () => string | null;

  // Utility to format error externally if needed
  buildUserMessage: (err: NormalizedUploadError) => string;
}

/* --------------------------------------------------
 * Type Guards
 * -------------------------------------------------- */
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

/* --------------------------------------------------
 * Hook
 * -------------------------------------------------- */
export function useEpisodeUpload(
  options: UseEpisodeUploadOptions = {}
): UseEpisodeUploadReturn {
  const {
    autoLoadData = true,
    onSuccess,
    onError,
    onPhaseChange,
    audioMaxMB = 150,
    documentMaxMB = 50,
    audioAllowedExt = [".mp3", ".wav", ".m4a", ".aac", ".ogg"],
    documentAllowedExt = [".pdf", ".doc", ".docx"],
  } = options;

  const supabase = createSupabaseBrowserClient();

  // Reference data
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [filteredSubcategories, setFilteredSubcategories] = useState<
    Subcategory[]
  >([]);

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const [form, setForm] = useState<EpisodeFormState>({
    title: "",
    description: "",
    programId: "",
    episodeNumber: "",
    categoryId: "",
    subcategoryId: "",
    publishedAt: new Date().toISOString().split("T")[0],
  });

  const [audioFile, setAudioFileInternal] = useState<File | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [docPageCount, setDocPageCount] = useState<string>("");
  const [docReferenceCount, setDocReferenceCount] = useState<string>("");

  const [phase, setPhase] = useState<EpisodeUploadPhase>("idle");
  const [audioProgress, setAudioProgress] = useState(0);
  const [documentProgress, setDocumentProgress] = useState(0);
  const [createdEpisodeId, setCreatedEpisodeId] = useState<string | null>(null);

  const audioXhrRef = useRef<XMLHttpRequest | null>(null);
  const documentXhrRef = useRef<XMLHttpRequest | null>(null);

  const [lastError, setLastError] = useState<NormalizedUploadError | null>(
    null
  );

  /* --------------------------------------------------
   * Auto page count (PDF) via import dinâmico
   * -------------------------------------------------- */
  useEffect(() => {
    (async () => {
      if (!documentFile) return;
      if (!documentFile.type.toLowerCase().includes("pdf")) return;
      // Do not re-calculate if a value is already present
      if (docPageCount.trim() !== "") return;

      try {
        const { extractPdfPageCount } = await import(
          "@/src/lib/pdf/extract-pdf-page-count"
        );
        const count = await extractPdfPageCount(documentFile);
        if (count && !isNaN(count)) {
          setDocPageCount(String(count));
        }
      } catch (err) {
        console.warn("Could not extract PDF page count", err);
      }
    })();
  }, [documentFile, docPageCount]);

  /* --------------------------------------------------
   * Phase Management
   * -------------------------------------------------- */
  function transitionPhase(next: EpisodeUploadPhase) {
    if (
      next === "idle" ||
      next === "audio-preparing" ||
      next === "audio-uploading"
    ) {
      setLastError(null);
    }
    setPhase(next);
  }

  /* --------------------------------------------------
   * Load reference data
   * -------------------------------------------------- */
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

  // Subcategories update
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
      setSubcategories([]);
      setFilteredSubcategories([]);
    }
  }, [selectedCategory, supabase]);

  // Bind category from program if applicable
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

  // External phase watcher
  useEffect(() => {
    onPhaseChange?.(phase);
  }, [phase, onPhaseChange]);

  /* --------------------------------------------------
   * Setters / Helpers
   * -------------------------------------------------- */
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

  /* --------------------------------------------------
   * Cancel
   * -------------------------------------------------- */
  const cancelAudioUpload = () => {
    if (audioXhrRef.current && phase === "audio-uploading") {
      audioXhrRef.current.abort();
      const err = normalizeUploadError({ code: "UPLOAD_ABORTED" });
      setLastError(err);
      transitionPhase("idle");
      setAudioProgress(0);
      onError?.(buildUserMessage(err), err);
    }
  };

  const cancelDocumentUpload = () => {
    if (
      documentXhrRef.current &&
      (phase === "document-uploading" || phase === "document-preparing")
    ) {
      documentXhrRef.current.abort();
      const err = normalizeUploadError({ code: "UPLOAD_ABORTED" });
      setLastError(err);
      transitionPhase("audio-done");
      setDocumentProgress(0);
      onError?.(buildUserMessage(err), err);
    }
  };

  /* --------------------------------------------------
   * Reset
   * -------------------------------------------------- */
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
    transitionPhase("idle");
    setCreatedEpisodeId(null);
    setLastError(null);
    audioXhrRef.current?.abort();
    documentXhrRef.current?.abort();
  };

  /* --------------------------------------------------
   * Document Upload (optional)
   * -------------------------------------------------- */
  const uploadDocumentIfNeeded = async (episodeId: string) => {
    if (!documentFile) return;
    try {
      transitionPhase("document-preparing");

      // Local validations
      const typeErr = validateFileType(documentFile, documentAllowedExt);
      if (typeErr) {
        setLastError(typeErr);
        transitionPhase("audio-done"); // do not kill entire episode
        onError?.(buildUserMessage(typeErr), typeErr);
        return;
      }
      const sizeErr = validateFileSize(documentFile, documentMaxMB);
      if (sizeErr) {
        setLastError(sizeErr);
        transitionPhase("audio-done");
        onError?.(buildUserMessage(sizeErr), sizeErr);
        return;
      }

      const raw = (await getDocumentSignedUploadUrl(
        episodeId,
        documentFile.name
      )) as DocSignedResult;

      if (!raw.success) {
        const err = normalizeUploadError({
          code: "SIGNED_URL_FAIL",
          technicalMessage: raw.error,
        });
        setLastError(err);
        transitionPhase("audio-done");
        onError?.(buildUserMessage(err), err);
        return;
      }

      const { signedUrl, storagePath, sanitizedFileName } = raw;

      transitionPhase("document-uploading");
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
            const err = normalizeUploadError({
              code: "UPLOAD_HTTP_STATUS",
              meta: { status: xhr.status },
            });
            setLastError(err);
            reject(err);
          }
        };
        xhr.onerror = () => {
          const err = normalizeUploadError({ code: "UPLOAD_NETWORK" });
          setLastError(err);
          reject(err);
        };
        xhr.onabort = () => {
          const err = normalizeUploadError({ code: "UPLOAD_ABORTED" });
          setLastError(err);
          reject(err);
        };
        xhr.open("PUT", signedUrl, true);
        xhr.setRequestHeader(
          "Content-Type",
          documentFile.type || "application/octet-stream"
        );
        xhr.send(documentFile);
      });

      transitionPhase("document-registering");
      const register = await registerUploadedDocumentAction({
        episodeId,
        storagePath,
        fileName: sanitizedFileName,
        fileSize: documentFile.size,
        pageCount: docPageCount ? Number(docPageCount) : null,
        referenceCount: docReferenceCount ? Number(docReferenceCount) : null,
      });

      if (!register.success) {
        const err = normalizeUploadError({
          code: "DOCUMENT_REGISTER_FAIL",
          technicalMessage: register.error,
        });
        setLastError(err);
        // Do not block overall success of episode creation
        onError?.(buildUserMessage(err), err);
      }
    } catch (e: any) {
      const err = e?.code
        ? normalizeUploadError({ code: e.code, technicalMessage: e?.message })
        : normalizeUploadError({
            code: "UNKNOWN",
            technicalMessage: e?.message,
          });
      setLastError(err);
      onError?.(buildUserMessage(err), err);
    }
  };

  /* --------------------------------------------------
   * Submit Flow
   * -------------------------------------------------- */
  const submit = async (status: "draft" | "scheduled" | "published") => {
    if (!audioFile || !form.title.trim()) {
      const err = normalizeUploadError({
        code: "UNKNOWN",
        technicalMessage: "Áudio e título são obrigatórios",
      });
      setLastError(err);
      onError?.(buildUserMessage(err), err);
      return;
    }

    // Local validations (audio)
    const audioExtErr = validateFileType(audioFile, audioAllowedExt);
    if (audioExtErr) {
      setLastError(audioExtErr);
      onError?.(buildUserMessage(audioExtErr), audioExtErr);
      return;
    }

    const audioSizeErr = validateFileSize(audioFile, audioMaxMB);
    if (audioSizeErr) {
      setLastError(audioSizeErr);
      onError?.(buildUserMessage(audioSizeErr), audioSizeErr);
      return;
    }

    try {
      transitionPhase("audio-preparing");
      const raw = (await getAudioSignedUploadUrlForCreation(
        audioFile.name
      )) as AudioSignedResult;

      if (!raw.success) {
        const err = normalizeUploadError({
          code: "SIGNED_URL_FAIL",
          technicalMessage: raw.error,
        });
        setLastError(err);
        transitionPhase("error");
        onError?.(buildUserMessage(err), err);
        return;
      }

      const {
        signedUrl: audioSignedUrl,
        publicUrl: audioPublicUrl,
        sanitizedFileName: audioFileName,
      } = raw;

      transitionPhase("audio-uploading");
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
            const err = normalizeUploadError({
              code: "UPLOAD_HTTP_STATUS",
              meta: { status: xhr.status },
            });
            setLastError(err);
            reject(err);
          }
        };
        xhr.onerror = () => {
          const err = normalizeUploadError({ code: "UPLOAD_NETWORK" });
          setLastError(err);
          reject(err);
        };
        xhr.onabort = () => {
          const err = normalizeUploadError({ code: "UPLOAD_ABORTED" });
          setLastError(err);
          reject(err);
        };
        xhr.open("PUT", audioSignedUrl, true);
        xhr.setRequestHeader("Content-Type", audioFile.type);
        xhr.send(audioFile);
      });

      transitionPhase("audio-done");
      transitionPhase("episode-creating");

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
        const err = normalizeUploadError({
          code: "EPISODE_CREATE_FAIL",
          technicalMessage: createResult.error,
        });
        setLastError(err);
        transitionPhase("error");
        onError?.(buildUserMessage(err), err);
        return;
      }

      const epId = createResult.episode.id;
      setCreatedEpisodeId(epId);

      if (documentFile) {
        await uploadDocumentIfNeeded(epId);
      }

      transitionPhase("finished");
      revalidateAdminDashboard();
      onSuccess?.(createResult.episode);
    } catch (e: any) {
      const err = normalizeUploadError({
        code: "UNKNOWN",
        technicalMessage: e?.message,
      });
      setLastError(err);
      transitionPhase("error");
      onError?.(buildUserMessage(err), err);
    }
  };

  /* --------------------------------------------------
   * Return
   * -------------------------------------------------- */
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
    lastError,
    isBusy,
    readablePhaseMessage,
    buildUserMessage,
  };
}
