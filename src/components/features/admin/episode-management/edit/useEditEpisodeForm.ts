// src/components/features/admin/episode-management/edit/useEditEpisodeForm.ts
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/src/hooks/use-toast";
import { updateEpisodeSchema, UpdateEpisodeInput } from "./edit-episode.schema";
import {
  Episode,
  Category,
  Subcategory,
  Program,
  Tag,
  EpisodeDocument,
} from "@/src/lib/types";

// Funções utilitárias
function computeDiff(
  original: Record<string, any>,
  current: Record<string, any>
) {
  const changed: Record<string, any> = {};
  const normalize = (v: any) =>
    Array.isArray(v) ? JSON.stringify([...v].sort()) : v ?? null;
  for (const key of Object.keys(current)) {
    if (normalize(original[key]) !== normalize(current[key])) {
      changed[key] = current[key];
    }
  }
  return changed;
}

function normalizeEpisodeTags(raw: any): Tag[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((t) => {
      if (!t) return null;
      if (typeof t === "string") {
        return { id: t, name: t, created_at: "" } as Tag;
      }
      if ("tag" in t && t.tag && typeof t.tag === "object") {
        return t.tag;
      }
      if (t.id && t.name) return t as Tag;
      return null;
    })
    .filter(Boolean) as Tag[];
}

interface UseEditEpisodeFormProps {
  episode: Episode;
  categories: Category[];
  subcategories: Subcategory[];
  programs: Program[];
  allTags: Tag[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUpdate: (
    episodeId: string,
    updates: Partial<UpdateEpisodeInput>
  ) => Promise<boolean>;
}

export function useEditEpisodeForm({
  episode,
  categories,
  subcategories,
  programs,
  allTags,
  isOpen,
  onOpenChange,
  onUpdate,
}: UseEditEpisodeFormProps) {
  const { toast } = useToast();
  const [currentDocument, setCurrentDocument] =
    useState<EpisodeDocument | null>(null);
  const [unsavedAlertOpen, setUnsavedAlertOpen] = useState(false);
  const [allTagsState, setAllTagsState] = useState<Tag[]>(allTags);

  useEffect(() => {
    setAllTagsState(allTags);
  }, [allTags]);

  const form = useForm<UpdateEpisodeInput>({
    resolver: zodResolver(updateEpisodeSchema),
    defaultValues: {
      title: "",
      description: "",
      program_id: null,
      category_id: "",
      subcategory_id: null,
      episode_number: undefined,
      tags: [],
    },
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty, isSubmitting },
    getValues,
  } = form;

  const categoryId = watch("category_id");
  const filteredSubcategories = useMemo(
    () => subcategories.filter((s) => s.category_id === categoryId),
    [categoryId, subcategories]
  );

  const originalRef = useRef<UpdateEpisodeInput | null>(null);

  // Carregar dados quando abre
  useEffect(() => {
    if (isOpen && episode) {
      const normalizedTags = normalizeEpisodeTags(episode.tags);
      const original: UpdateEpisodeInput = {
        title: episode.title,
        description: episode.description ?? "",
        program_id: episode.program_id ? String(episode.program_id) : null,
        episode_number: episode.episode_number ?? undefined,
        category_id: episode.category_id ? String(episode.category_id) : "",
        subcategory_id: episode.subcategory_id
          ? String(episode.subcategory_id)
          : null,
        tags: normalizedTags.map((t) => t.id),
      };
      originalRef.current = original;
      reset(original, { keepDirty: false });
      setCurrentDocument(episode.episode_documents?.[0] ?? null);

      // Garantir tags recém associadas
      setAllTagsState((prev) => {
        const map = new Map(prev.map((t) => [t.id, t]));
        normalizedTags.forEach((t) => {
          if (!map.has(t.id)) map.set(t.id, t);
        });
        return Array.from(map.values());
      });
    }
  }, [episode, isOpen, reset]);

  // Reset subcategoria quando categoria muda
  useEffect(() => {
    if (!isOpen) return;
    const currentSub = watch("subcategory_id");
    if (currentSub && !filteredSubcategories.find((s) => s.id === currentSub)) {
      form.setValue("subcategory_id", null, { shouldDirty: true });
    }
  }, [categoryId, filteredSubcategories, watch, form, isOpen]);

  // Atalhos de teclado
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        void handleSubmit(onSubmit)();
      } else if (e.key === "Escape") {
        e.preventDefault();
        attemptClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, handleSubmit]);

  const hasRealChanges = useCallback((): boolean => {
    if (!originalRef.current) return false;
    const diff = computeDiff(originalRef.current, getValues());
    return Object.keys(diff).length > 0;
  }, [getValues]);

  const attemptClose = () => {
    if (hasRealChanges()) setUnsavedAlertOpen(true);
    else onOpenChange(false);
  };

  // Submit
  const onSubmit = async (data: UpdateEpisodeInput) => {
    if (!originalRef.current) return;
    const diff = computeDiff(originalRef.current, data);
    if (Object.keys(diff).length === 0) {
      toast({ description: "Nenhuma alteração para salvar." });
      return;
    }
    const ok = await onUpdate(episode.id, diff);
    if (ok) {
      toast({ description: "Episódio atualizado com sucesso." });
      onOpenChange(false);
    }
  };

  // Nova tag criada (callback)
  const handleCreateTagInSelector = (newTag: Tag) => {
    setAllTagsState((prev) =>
      prev.some((t) => t.id === newTag.id) ? prev : [...prev, newTag]
    );
  };

  // Retornar tudo que o componente precisa
  return {
    form,
    categories,
    programs,
    filteredSubcategories,
    allTagsState,
    currentDocument,
    setCurrentDocument,
    unsavedAlertOpen,
    setUnsavedAlertOpen,
    attemptClose,
    onSubmit,
    handleCreateTagInSelector,
    hasRealChanges,
  };
}
