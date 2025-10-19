// src/components/features/admin/episode-management/edit/useEditEpisodeForm.ts
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
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

function computeDiff(
  original: Record<string, any>,
  current: Record<string, any>
): Partial<UpdateEpisodeInput> {
  const changed: Partial<UpdateEpisodeInput> = {};
  const normalize = (v: any) => {
    if (Array.isArray(v)) return JSON.stringify([...v].sort());
    return v === "" || v === undefined ? null : v;
  };
  const allKeys = new Set([...Object.keys(original), ...Object.keys(current)]);
  allKeys.forEach((key) => {
    const originalValue = normalize(original[key]);
    const currentValue = normalize(current[key]);
    if (originalValue !== currentValue) {
      (changed as any)[key] = current[key];
    }
  });
  return changed;
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

  const originalRef = useRef<UpdateEpisodeInput | null>(null);

  const form = useForm<UpdateEpisodeInput>({
    resolver: zodResolver(updateEpisodeSchema),
    defaultValues: { tags: [] },
  });

  const { control, watch, setValue, getValues, reset, handleSubmit } = form;
  const categoryId = watch("category_id");

  const filteredSubcategories = useMemo(
    () =>
      subcategories.filter((s) => String(s.category_id) === String(categoryId)),
    [categoryId, subcategories]
  );

  const hasRealChanges = useCallback((): boolean => {
    if (!originalRef.current) return false;
    const diff = computeDiff(originalRef.current, getValues());
    return Object.keys(diff).length > 0;
  }, [getValues]);

  const attemptClose = useCallback(() => {
    hasRealChanges() ? setUnsavedAlertOpen(true) : onOpenChange(false);
  }, [hasRealChanges, onOpenChange]);

  const onSubmit = useCallback(
    async (data: UpdateEpisodeInput) => {
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
    },
    [episode.id, onUpdate, onOpenChange, toast]
  );

  useEffect(() => {
    if (isOpen && episode) {
      const episodeTagIds = (episode.tags || []).map((tag) => tag.id);
      const initialValues: UpdateEpisodeInput = {
        title: episode.title ?? "",
        description: episode.description ?? "",
        program_id: episode.program_id ? String(episode.program_id) : null,
        episode_number: episode.episode_number ?? undefined,
        category_id: episode.category_id ? String(episode.category_id) : "",
        subcategory_id: episode.subcategory_id
          ? String(episode.subcategory_id)
          : null,
        tags: episodeTagIds,
      };
      reset(initialValues);
      originalRef.current = initialValues;
      setCurrentDocument(episode.episode_documents?.[0] ?? null);
      setAllTagsState(allTags);
    }
  }, [episode, allTags, isOpen, reset]);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "category_id") {
        setValue("subcategory_id", null, { shouldDirty: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  const handleCreateTagInSelector = (newTag: Tag) => {
    setAllTagsState((prev) => [...prev, newTag]);
  };

  return {
    form,
    control,
    allTagsState,
    currentDocument,
    setCurrentDocument,
    unsavedAlertOpen,
    setUnsavedAlertOpen,
    attemptClose,
    onSubmit,
    handleCreateTagInSelector,
    hasRealChanges,
    filteredSubcategories,
  };
}
