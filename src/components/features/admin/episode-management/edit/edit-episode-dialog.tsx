// src/components/features/admin/episode-management/edit/edit-episode-dialog.tsx
"use client";

import dynamic from "next/dynamic";
import { Controller } from "react-hook-form";
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
import { Episode, Category, Subcategory, Program, Tag } from "@/src/lib/types";
import { useEditEpisodeForm } from "./useEditEpisodeForm";
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

interface EditEpisodeDialogProps {
  episode: Episode;
  categories: Category[];
  subcategories: Subcategory[];
  programs: Program[];
  allTags: Tag[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUpdate: (episodeId: string, updates: Partial<any>) => Promise<boolean>;
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
  const {
    form,
    categories: categoriesFromHook,
    programs: programsFromHook,
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
  } = useEditEpisodeForm({
    episode,
    categories,
    subcategories,
    programs,
    allTags,
    isOpen,
    onOpenChange,
    onUpdate,
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

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
                              {programsFromHook.map((p) => (
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
                              {categoriesFromHook.map((c) => (
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

                    {/* Áudio (substituição não mexe no form diff) */}
                    <AudioField
                      episodeId={episode.id}
                      currentFileName={episode.file_name || null}
                      currentAudioUrl={episode.audio_url}
                      onReplaced={() => {
                        // Aqui você pode usar o toast do hook se quiser
                      }}
                    />

                    {/* Documento */}
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
                  disabled={isSubmitting || !hasRealChanges()}
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
