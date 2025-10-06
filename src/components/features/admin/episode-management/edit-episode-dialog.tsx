"use client";

import { useEffect, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPortal,
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
import {
  Episode,
  Category,
  Subcategory,
  Program,
  Tag,
  EpisodeDocument,
} from "@/src/lib/types";
import { Trash2, FileAudio, FileText, Upload, RefreshCw } from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import {
  deleteDocumentAction,
  uploadDocumentAction,
  updateAudioAction,
} from "@/src/app/admin/episodes/documentActions"; // MUDANÇA IMPORTANTE
import { DialogOverlay } from "@/src/components/ui/dialog-overlay";

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
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [currentDocument, setCurrentDocument] = useState<
    EpisodeDocument | undefined
  >();
  const [newDocumentFile, setNewDocumentFile] = useState<File | null>(null);
  const [newAudioFile, setNewAudioFile] = useState<File | null>(null);
  const [isUpdatingAudio, setIsUpdatingAudio] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && episode) {
      reset({
        title: episode.title,
        description: episode.description ?? "",
        // Convertendo IDs para string para garantir a correspondência no Select
        // e tratando valores nulos de forma explícita.
        program_id: episode.program_id ? String(episode.program_id) : null,
        episode_number: episode.episode_number ?? undefined,
        category_id: String(episode.category_id), // Campo obrigatório
        subcategory_id: episode.subcategory_id
          ? String(episode.subcategory_id)
          : null,
        tags:
          episode.tags?.map((t: any) => (typeof t === "object" ? t.id : t)) ||
          [],
      });
      setCurrentDocument(episode.episode_documents?.[0]);
      setNewDocumentFile(null);
      setNewAudioFile(null);
    }
  }, [episode, isOpen, reset]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (newDocumentFile) {
        const formData = new FormData();
        formData.append("file", newDocumentFile);
        await uploadDocumentAction(episode.id, formData);
      }
      await onUpdate(episode.id, data);
    } catch (error: any) {
      console.error("Submit error:", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!currentDocument?.storage_path) return;
    const result = await deleteDocumentAction(
      currentDocument.id,
      currentDocument.storage_path
    );
    if (result.success) {
      toast({ description: "Documento removido." });
      setCurrentDocument(undefined);
    } else {
      toast({ description: result.error, variant: "destructive" });
    }
  };

  const handleConfirmAudioChange = async () => {
    if (!newAudioFile || !episode) return;

    setIsUpdatingAudio(true);
    const formData = new FormData();
    formData.append("file", newAudioFile);
    formData.append("oldFile", episode.file_name || "");

    const result = await updateAudioAction(episode.id, formData);

    if (result.success) {
      toast({ description: "Áudio do episódio foi atualizado." });
      onOpenChange(false);
    } else {
      toast({
        title: "Erro ao mudar o áudio",
        description: result.error,
        variant: "destructive",
      });
    }
    setIsUpdatingAudio(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Editar Episódio: {episode.title}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <ScrollArea className="flex-1 pr-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input id="title" {...register("title")} className="mt-1" />
                    {errors.title?.message && (
                      <p className="text-red-500 text-xs mt-1">
                        {String(errors.title.message)}
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
                    {errors.category_id?.message && (
                      <p className="text-red-500 text-xs mt-1">
                        {String(errors.category_id.message)}
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
                          {newAudioFile ? newAudioFile.name : episode.file_name}
                        </span>
                      </div>
                      <Input
                        type="file"
                        ref={audioInputRef}
                        className="hidden"
                        onChange={(e) =>
                          setNewAudioFile(e.target.files?.[0] || null)
                        }
                        accept="audio/*"
                      />
                      {newAudioFile ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button type="button" variant="secondary" size="sm">
                              Confirmar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Confirmar mudança de áudio?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                O áudio antigo será deletado e substituído por{" "}
                                <strong>{newAudioFile.name}</strong>.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                onClick={() => setNewAudioFile(null)}
                              >
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleConfirmAudioChange}
                                disabled={isUpdatingAudio}
                              >
                                {isUpdatingAudio ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Confirmar"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => audioInputRef.current?.click()}
                        >
                          Mudar
                        </Button>
                      )}
                    </div>
                  </div>
                  {/* Seção de Documento */}
                  <div className="space-y-2">
                    <Label>Documento</Label>
                    {currentDocument ? (
                      <div className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <a
                            href={currentDocument.public_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate text-sm hover:underline"
                          >
                            {currentDocument.file_name}
                          </a>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Confirmar exclusão?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação removerá o documento permanentemente.
                                Deseja continuar?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteDocument}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <span className="truncate text-sm">
                            {newDocumentFile
                              ? newDocumentFile.name
                              : "Nenhum documento"}
                          </span>
                        </div>
                        <Input
                          type="file"
                          id="document-upload"
                          className="hidden"
                          onChange={(e) =>
                            setNewDocumentFile(e.target.files?.[0] || null)
                          }
                          accept=".pdf,.doc,.docx"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            document.getElementById("document-upload")?.click()
                          }
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Anexar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
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
      </DialogPortal>
    </Dialog>
  );
}
