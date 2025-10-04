// src/components/features/admin/episode-management/edit-episode-dialog.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Label } from "@/src/components/ui/label";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import RichTextEditor from "@/src/components/ui/RichTextEditor";
import { TagSelector } from "@/src/components/features/admin/TagSelector";
import { Episode, Category, Subcategory, Program, Tag } from "@/src/lib/types";
import { Trash2, FileAudio, FileText } from "lucide-react";

interface EditEpisodeDialogProps {
  episode: Episode;
  categories: Category[];
  subcategories: Subcategory[];
  programs: Program[];
  allTags: Tag[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUpdate: (episodeId: string, updates: any) => Promise<boolean>;
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
  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      title: episode.title,
      description: episode.description,
      program_id: episode.program_id,
      episode_number: episode.episode_number,
      category_id: episode.category_id,
      subcategory_id: episode.subcategory_id,
      tags: episode.tags || [],
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    reset({
      title: episode.title,
      description: episode.description,
      program_id: episode.program_id,
      episode_number: episode.episode_number,
      category_id: episode.category_id,
      subcategory_id: episode.subcategory_id,
      tags: episode.tags || [],
    });
  }, [episode, reset]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    const updates = {
      ...data,
      episode_number: data.episode_number ? Number(data.episode_number) : null,
      tags: data.tags.map((tag: any) => tag.id),
    };
    const success = await onUpdate(episode.id, updates);
    if (success) {
      onOpenChange(false);
    }
    setIsSubmitting(false);
  };

  const episodeDocument = (episode as any).episode_documents?.[0];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar Episódio: {episode.title}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-hidden"
        >
          <ScrollArea className="h-full pr-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
              {/* Coluna Esquerda */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input id="title" {...register("title")} className="mt-1" />
                </div>
                <div>
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
                <div>
                  <Label>Tags</Label>
                  <Controller
                    name="tags"
                    control={control}
                    render={({ field }) => (
                      <TagSelector
                        tags={allTags}
                        selectedTags={field.value}
                        onSelectedTagsChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>

              {/* Coluna Direita */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Programa</Label>
                  <Controller
                    name="program_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
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
                <div className="space-y-2">
                  <Label htmlFor="episode_number">Nº do Episódio</Label>
                  <Input
                    id="episode_number"
                    type="number"
                    {...register("episode_number")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Controller
                    name="category_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
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
                </div>
                <div className="space-y-2">
                  <Label>Subcategoria</Label>
                  <Controller
                    name="subcategory_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma subcategoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {subcategories.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Arquivo de Áudio</Label>
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileAudio className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <span className="truncate text-sm">
                        {episode.file_name}
                      </span>
                    </div>
                    <Button type="button" variant="outline" size="sm">
                      Mudar áudio
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Documento Anexado</Label>
                  {episodeDocument ? (
                    <div className="p-3 border rounded-md space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <span className="truncate text-sm">
                            {episodeDocument.file_name}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Tamanho:{" "}
                        {episodeDocument.file_size
                          ? (episodeDocument.file_size / (1024 * 1024)).toFixed(
                              2
                            )
                          : "N/A"}{" "}
                        MB
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="pages" className="text-xs">
                            Páginas
                          </Label>
                          <Input
                            id="pages"
                            type="number"
                            defaultValue={episodeDocument.page_count ?? ""}
                          />
                        </div>
                        <div>
                          <Label htmlFor="references" className="text-xs">
                            Referências
                          </Label>
                          <Input
                            id="references"
                            type="number"
                            defaultValue={episodeDocument.reference_count ?? ""}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button type="button" variant="outline" className="w-full">
                      Anexar Documento
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4 pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </ScrollArea>
        </form>
      </DialogContent>
    </Dialog>
  );
}
