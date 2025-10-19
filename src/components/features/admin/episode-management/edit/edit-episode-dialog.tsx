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
// IMPORTAÇÃO ADICIONADA
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Episode, Category, Subcategory, Program, Tag } from "@/src/lib/types";
import { useEditEpisodeForm } from "./useEditEpisodeForm";
import { AudioField } from "./fields/audio-field";
import { DocumentField } from "./fields/document-field";
import { TagSelector } from "@/src/components/features/admin/TagSelector";

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
    control, // O control agora vem diretamente do 'form'
    handleSubmit,
    register,
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

            {/* O WRAPPER <Form> FOI ADICIONADO AQUI */}
            <Form {...form}>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <ScrollArea className="flex-1 pr-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                    <div className="md:col-span-2 space-y-6">
                      {/* Título */}
                      <FormField
                        control={control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título</FormLabel>
                            <Input
                              placeholder="Digite o título..."
                              {...field}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Descrição */}
                      <FormField
                        control={control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <RichTextEditor
                              content={field.value ?? ""}
                              onChange={field.onChange}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Tags */}
                      <FormField
                        control={control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Tags</FormLabel>
                            <TagSelector
                              allTags={allTagsState}
                              value={field.value || []}
                              onChange={field.onChange}
                              onCreateTag={handleCreateTagInSelector}
                              placeholder="Selecione as tags..."
                              allowCreate
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-6">
                      {/* Programa */}
                      <FormField
                        control={control}
                        name="program_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Programa</FormLabel>
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Número do Episódio */}
                      <FormField
                        control={control}
                        name="episode_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nº do Episódio</FormLabel>
                            <Input
                              type="number"
                              min={1}
                              placeholder="Ex: 12"
                              {...field}
                              onChange={(event) =>
                                field.onChange(+event.target.value)
                              }
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Categoria */}
                      <FormField
                        control={control}
                        name="category_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoria</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Subcategoria */}
                      <FormField
                        control={control}
                        name="subcategory_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subcategoria</FormLabel>
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
                                {filteredSubcategories.map((s: Subcategory) => (
                                  <SelectItem key={s.id} value={s.id}>
                                    {s.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Campos que não são do formulário */}
                      <AudioField
                        episodeId={episode.id}
                        currentFileName={episode.file_name || null}
                        currentAudioUrl={episode.audio_url}
                        onReplaced={() => {}}
                      />
                      <DocumentField
                        episodeId={episode.id}
                        document={currentDocument}
                        onUpload={setCurrentDocument}
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
            </Form>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      {/* AlertDialog não precisa de mudanças */}
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
