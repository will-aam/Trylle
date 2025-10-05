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
import { Trash2, FileAudio, FileText, Upload, RefreshCw } from "lucide-react"; // NOVO: Ícone RefreshCw
import { useToast } from "@/src/hooks/use-toast";
import {
  deleteEpisodeDocument,
  uploadEpisodeDocument,
  updateEpisodeAudio, // 1. Importar a nova função de áudio
} from "@/src/services/episodeService";
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
    setValue,
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // NOVO: Estados para a lógica de mudança de áudio
  const [newAudioFile, setNewAudioFile] = useState<File | null>(null);
  const [isUpdatingAudio, setIsUpdatingAudio] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && episode) {
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
      setCurrentDocument(episode.episode_documents?.[0]);
      setNewDocumentFile(null);
      setNewAudioFile(null); // Limpa o estado do novo áudio
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (audioInputRef.current) {
        audioInputRef.current.value = "";
      }
    }
  }, [episode, isOpen, reset]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (newDocumentFile) {
        await uploadEpisodeDocument(episode.id, newDocumentFile);
      }
      await onUpdate(episode.id, data);
    } catch (error: any) {
      console.error("Submit error:", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!currentDocument) return;
    if (!currentDocument.storage_path) {
      setCurrentDocument(undefined);
      setNewDocumentFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    try {
      await deleteEpisodeDocument(
        currentDocument.id,
        currentDocument.storage_path
      );
      toast({
        title: "Documento Removido",
        description: "O documento foi excluído com sucesso.",
      });
      setCurrentDocument(undefined);
      setValue("page_count", undefined);
      setValue("reference_count", undefined);
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (currentDocument) {
        toast({
          title: "Ação necessária",
          description: "Remova o documento existente antes de anexar um novo.",
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setNewDocumentFile(file);
      setCurrentDocument({
        id: `temp-${Date.now()}`,
        episode_id: episode.id,
        file_name: file.name,
        public_url: "",
        storage_path: "",
        created_at: new Date().toISOString(),
        file_size: file.size,
        page_count: null,
        reference_count: null,
      });
      setValue("page_count", undefined);
      setValue("reference_count", undefined);
    }
  };

  // NOVO: Função para selecionar um novo arquivo de áudio
  const handleAudioFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      setNewAudioFile(file);
    } else if (file) {
      toast({
        title: "Arquivo Inválido",
        description: "Por favor, selecione um arquivo de áudio.",
        variant: "destructive",
      });
    }
  };

  // NOVO: Função para executar a troca do áudio
  const handleConfirmAudioChange = async () => {
    if (!newAudioFile || !episode) return;

    setIsUpdatingAudio(true);
    try {
      await updateEpisodeAudio(episode.id, episode.file_name, newAudioFile);
      toast({
        title: "Sucesso!",
        description: "O áudio do episódio foi atualizado.",
      });
      onOpenChange(false); // Fecha o modal após o sucesso
    } catch (error: any) {
      toast({
        title: "Erro ao mudar o áudio",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingAudio(false);
      setNewAudioFile(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
                {/* ... (código da coluna esquerda) ... */}
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
                {/* ... (código da coluna direita até o áudio) ... */}
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
                        {/* NOVO: Mostra o nome do novo áudio se ele foi selecionado */}
                        {newAudioFile ? newAudioFile.name : episode.file_name}
                      </span>
                    </div>
                    {/* NOVO: Input de arquivo escondido para o áudio */}
                    <Input
                      type="file"
                      ref={audioInputRef}
                      className="hidden"
                      onChange={handleAudioFileSelect}
                      accept="audio/*"
                    />
                    {/* NOVO: Lógica condicional para os botões */}
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
                              <strong>{newAudioFile.name}</strong>. Esta ação é
                              imediata e não pode ser desfeita.
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
                                "Confirmar e Mudar"
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
                        Mudar áudio
                      </Button>
                    )}
                  </div>
                </div>

                {/* ... (resto do código da coluna direita, incluindo o documento) ... */}
                <div className="space-y-2">
                  <Label>Documento Anexado</Label>
                  {currentDocument ? (
                    <div className="p-3 border rounded-md space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <span className="truncate text-sm">
                            {currentDocument.file_name}
                          </span>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Você tem certeza?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação irá remover o documento.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteDocument}>
                                Confirmar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Tamanho:{" "}
                        {currentDocument.file_size
                          ? (currentDocument.file_size / (1024 * 1024)).toFixed(
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
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" /> Anexar Documento
                      </Button>
                      <Input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.txt"
                      />
                    </>
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
    </Dialog>
  );
}
