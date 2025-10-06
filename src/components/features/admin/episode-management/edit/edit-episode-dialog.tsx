"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { DialogOverlay } from "@/src/components/ui/dialog-overlay";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Button } from "@/src/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { useToast } from "@/src/hooks/use-toast";

import { updateAudioAction } from "@/src/app/admin/episodes/documentActions";

import {
  Episode,
  Category,
  Subcategory,
  Program,
  Tag,
  EpisodeDocument,
} from "@/src/lib/types";

import { AudioField } from "./fields/audio-field";
import { DocumentField } from "./fields/document-field";
import { TagSelector } from "@/src/components/features/admin/TagSelector";

/* Lazy load do editor com skeleton */
const RichTextEditor = dynamic(
  () => import("@/src/components/ui/RichTextEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="h-40 w-full rounded-md bg-muted animate-pulse" />
    ),
  }
);

/* ---------------- Schema & Types ---------------- */
const updateEpisodeSchema = z
  .object({
    title: z.string().min(1, "O título é obrigatório."),
    description: z.string().optional().nullable(),
    program_id: z.string().optional().nullable(),
    episode_number: z
      .union([z.string(), z.number()])
      .transform((val) => (val === "" ? undefined : Number(val)))
      .refine(
        (val) =>
          val === undefined || (Number.isInteger(val) && Number(val) > 0),
        { message: "Número deve ser inteiro positivo" }
      )
      .optional(),
    category_id: z.string().min(1, "A categoria é obrigatória."),
    subcategory_id: z.string().optional().nullable(),
    tags: z.array(z.string()).optional().default([]), // IDs das tags
  })
  .strict();

export type UpdateEpisodeInput = z.infer<typeof updateEpisodeSchema>;

interface EditEpisodeDialogProps {
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

/* ---------------- Util: diff ---------------- */
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

/**
 * Normaliza tags caso chegue formato legado:
 * - string ID
 * - { tag: { ... } } (join intermediário)
 * - Tag já normalizada
 */
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

export function EditEpisodeDialog({
  episode,
  categories,
  subcategories,
  programs,
  allTags,
  isOpen,
  onOpenChange,
  onUpdate,
}: EditEpisodeDialogProps) {
  const { toast } = useToast();

  const [currentDocument, setCurrentDocument] =
    useState<EpisodeDocument | null>(null);
  const [unsavedAlertOpen, setUnsavedAlertOpen] = useState(false);
  const [allTagsState, setAllTagsState] = useState<Tag[]>(allTags);

  // Sincroniza tags externas quando mudam
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

  /* ------------- Carregar dados quando abre ------------- */
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

      // Garante tags novas no estado local
      setAllTagsState((prev) => {
        const map = new Map(prev.map((t) => [t.id, t]));
        normalizedTags.forEach((t) => {
          if (!map.has(t.id)) map.set(t.id, t);
        });
        return Array.from(map.values());
      });
    }
  }, [episode, isOpen, reset]);

  /* ------------- Reset subcategoria quando categoria muda ------------- */
  useEffect(() => {
    if (!isOpen) return;
    const currentSub = watch("subcategory_id");
    if (currentSub && !filteredSubcategories.find((s) => s.id === currentSub)) {
      form.setValue("subcategory_id", null, { shouldDirty: true });
    }
  }, [categoryId, filteredSubcategories, watch, form, isOpen]);

  /* ------------- Atalhos de teclado ------------- */
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

  /* ------------- Submit ------------- */
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

  /* ------------- Replace Áudio ------------- */
  const handleReplaceAudio = async (file: File): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("oldFile", episode.file_name || "");
      const result = await updateAudioAction(episode.id, formData);
      if (result.success) {
        toast({ description: "Áudio atualizado." });
        return true;
      }
      toast({
        title: "Erro ao atualizar áudio",
        description: result.error,
        variant: "destructive",
      });
      return false;
    } catch (e: any) {
      toast({
        title: "Erro inesperado",
        description: e?.message || "Falha ao enviar áudio.",
        variant: "destructive",
      });
      return false;
    }
  };

  /* ------------- Nova tag criada (callback) ------------- */
  const handleCreateTagInSelector = (newTag: Tag) => {
    setAllTagsState((prev) =>
      prev.some((t) => t.id === newTag.id) ? prev : [...prev, newTag]
    );
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => (open ? onOpenChange(true) : attemptClose())}
      >
        <DialogPortal>
          <DialogOverlay />
          <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="pr-10">
                Editar Episódio: {episode.title}
              </DialogTitle>
            </DialogHeader>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <ScrollArea className="flex-1 pr-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                  {/* Coluna principal */}
                  <div className="md:col-span-2 space-y-6">
                    {/* Título */}
                    <div className="space-y-2">
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        {...register("title")}
                        placeholder="Digite o título..."
                      />
                      {errors.title && (
                        <p className="text-xs text-red-500">
                          {errors.title.message}
                        </p>
                      )}
                    </div>

                    {/* Descrição */}
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                          <RichTextEditor
                            content={field.value ?? ""}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </div>

                    {/* Tags (IDs) */}
                    <Controller
                      name="tags"
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <Label>Tags</Label>
                          <TagSelector
                            allTags={allTagsState}
                            value={field.value || []}
                            onChange={field.onChange}
                            onCreateTag={handleCreateTagInSelector}
                          />
                          {errors.tags && (
                            <p className="text-xs text-red-500">
                              {(errors.tags as any).message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  {/* Coluna lateral */}
                  <div className="space-y-6">
                    {/* Programa */}
                    <div className="space-y-2">
                      <Label>Programa</Label>
                      <Controller
                        name="program_id"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={(v) =>
                              field.onChange(v === "" ? null : v)
                            }
                            value={field.value ?? ""}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Nenhum programa" />
                            </SelectTrigger>
                            <SelectContent>
                              {programs.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    {/* Número */}
                    <div className="space-y-2">
                      <Label htmlFor="episode_number">Nº do Episódio</Label>
                      <Input
                        id="episode_number"
                        type="number"
                        min={1}
                        placeholder="Ex: 12"
                        {...register("episode_number")}
                      />
                      {errors.episode_number && (
                        <p className="text-xs text-red-500">
                          {errors.episode_number.message as string}
                        </p>
                      )}
                    </div>

                    {/* Categoria */}
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Controller
                        name="category_id"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={(v) => field.onChange(v)}
                          >
                            <SelectTrigger>
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
                        )}
                      />
                      {errors.category_id && (
                        <p className="text-xs text-red-500">
                          {errors.category_id.message}
                        </p>
                      )}
                    </div>

                    {/* Subcategoria */}
                    <div className="space-y-2">
                      <Label>Subcategoria</Label>
                      <Controller
                        name="subcategory_id"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value ?? ""}
                            onValueChange={(v) =>
                              field.onChange(v === "" ? null : v)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredSubcategories.length === 0 && (
                                <div className="px-3 py-2 text-xs text-muted-foreground">
                                  Nenhuma subcategoria
                                </div>
                              )}
                              {filteredSubcategories.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                  {s.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.subcategory_id && (
                        <p className="text-xs text-red-500">
                          {errors.subcategory_id.message}
                        </p>
                      )}
                    </div>

                    {/* Áudio */}
                    <AudioField
                      currentFileName={episode.file_name || null}
                      onUploadReplace={handleReplaceAudio}
                    />

                    {/* Documento (usa actions internas no próprio componente) */}
                    <DocumentField
                      episodeId={episode.id}
                      document={currentDocument}
                      onUpload={(doc) => setCurrentDocument(doc)}
                      onDelete={() => setCurrentDocument(null)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </ScrollArea>

              <DialogFooter className="mt-auto pt-4 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={attemptClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !isDirty ||
                    !originalRef.current ||
                    !hasRealChanges()
                  }
                >
                  {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      {/* Dialog de alterações não salvas */}
      <AlertDialog open={unsavedAlertOpen} onOpenChange={setUnsavedAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair sem salvar?</AlertDialogTitle>
            <AlertDialogDescription>
              Existem alterações não salvas. Deseja realmente descartar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setUnsavedAlertOpen(false);
                onOpenChange(false);
              }}
            >
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
