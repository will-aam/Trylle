// src/components/features/admin/episode-management/edit-episode-dialog.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter, // Certifique-se que DialogFooter está sendo importado
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

// Definição do Schema para validação do formulário
const updateEpisodeSchema = z.object({
  title: z.string().min(1, "O título é obrigatório."),
  description: z.string().optional(),
  program_id: z.string().optional().nullable(),
  episode_number: z.coerce
    .number()
    .positive("O número do episódio deve ser positivo.")
    .optional()
    .nullable(),
  category_id: z.string().min(1, "A categoria é obrigatória."),
  subcategory_id: z.string().optional().nullable(),
  tags: z.array(z.any()).optional(),
  page_count: z.coerce.number().optional().nullable(),
  reference_count: z.coerce.number().optional().nullable(),
});

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
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateEpisodeSchema),
    defaultValues: {
      title: episode.title,
      description: episode.description ?? "",
      program_id: episode.program_id,
      episode_number: episode.episode_number,
      category_id: episode.category_id ?? "",
      subcategory_id: episode.subcategory_id,
      tags:
        episode.tags?.map((t: any) => (typeof t === "object" ? t.id : t)) || [],
      page_count: episode.episode_documents?.[0]?.page_count ?? undefined,
      reference_count:
        episode.episode_documents?.[0]?.reference_count ?? undefined,
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      reset({
        title: episode.title,
        description: episode.description ?? "",
        program_id: episode.program_id ?? "",
        episode_number: episode.episode_number ?? undefined,
        category_id: episode.category_id ?? "",
        subcategory_id: episode.subcategory_id ?? "",
        tags:
          episode.tags?.map((t: any) => (typeof t === "object" ? t.id : t)) ||
          [],
        page_count: episode.episode_documents?.[0]?.page_count ?? undefined,
        reference_count:
          episode.episode_documents?.[0]?.reference_count ?? undefined,
      });
    }
  }, [episode, isOpen, reset]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true); // Inicia o estado de "salvando"
    try {
      // Tenta executar a atualização
      await onUpdate(episode.id, data);
    } finally {
      // A mágica acontece aqui: o bloco `finally` é executado
      // SEMPRE, tanto em caso de sucesso quanto de erro.
      setIsSubmitting(false); // Finaliza o estado de "salvando"
    }
  };

  const episodeDocument = episode.episode_documents?.[0];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/* 👇 PASSO 1: O conteúdo do modal se torna um container flexível vertical */}
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar Episódio: {episode.title}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-hidden" // O formulário também se torna flexível
        >
          {/* 👇 PASSO 2: A área de rolagem ocupa todo o espaço disponível */}
          <ScrollArea className="flex-1 pr-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
              {/* Coluna Esquerda */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input id="title" {...register("title")} className="mt-1" />
                  {errors.title && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.title.message}
                    </p>
                  )}
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
                        selectedTags={allTags.filter((tag) =>
                          field.value?.includes(tag.id)
                        )}
                        onSelectedTagsChange={(tags) =>
                          field.onChange(tags.map((t) => t.id))
                        }
                      />
                    )}
                  />
                </div>
              </div>

              {/* Coluna Direita (conteúdo idêntico) */}
              <div className="space-y-6">
                {/* ... todo o conteúdo da coluna direita permanece o mesmo ... */}
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
                  {errors.category_id && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.category_id.message}
                    </p>
                  )}
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
                            {...register("page_count")}
                          />
                        </div>
                        <div>
                          <Label htmlFor="references" className="text-xs">
                            Referências
                          </Label>
                          <Input
                            id="references"
                            type="number"
                            {...register("reference_count")}
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
          </ScrollArea>

          {/* 👇 PASSO 3: O rodapé fica FORA da área de rolagem, mas DENTRO do formulário */}
          <DialogFooter className="mt-auto pt-4 border-t">
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
