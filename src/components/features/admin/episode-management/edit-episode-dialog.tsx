"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { useToast } from "@/src/hooks/use-toast";
import { createClient } from "@/src/lib/supabase-client";
import {
  Episode,
  Category,
  Subcategory,
  Tag,
  EpisodeDocument,
} from "@/src/lib/types";
import { File, Trash2, Upload } from "lucide-react";
import { TagSelector } from "../TagSelector";
import RichTextEditor from "../../../ui/RichTextEditor";

interface EditEpisodeDialogProps {
  episode: Episode | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onEpisodeUpdate: () => void;
}

const MAX_DOCUMENTS_PER_EPISODE = 1;

export function EditEpisodeDialog({
  episode,
  isOpen,
  onOpenChange,
  onEpisodeUpdate,
}: EditEpisodeDialogProps) {
  const supabase = createClient();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Episode>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [documents, setDocuments] = useState<EpisodeDocument[]>([]);
  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // New states for editing document metadata
  const [editingDoc, setEditingDoc] = useState<EpisodeDocument | null>(null);
  const [editingPageCount, setEditingPageCount] = useState<string>("");
  const [editingReferenceCount, setEditingReferenceCount] =
    useState<string>("");

  useEffect(() => {
    if (episode && isOpen) {
      setFormData({
        title: episode.title,
        description: episode.description,
        category_id: episode.category_id,
        subcategory_id: episode.subcategory_id,
      });
      const currentTags = episode.tags?.map((t: any) => t.tags) || [];
      setSelectedTags(currentTags);
      const fetchDocuments = async () => {
        const { data, error } = await supabase
          .from("episode_documents")
          .select("*")
          .eq("episode_id", episode.id)
          .order("created_at", { ascending: true });
        if (error) {
          toast({
            title: "Erro ao buscar documentos",
            description: error.message,
            variant: "destructive",
          });
        } else {
          const loadedDocuments = data || [];
          setDocuments(loadedDocuments);
          if (loadedDocuments.length > 0) {
            const docToEdit = loadedDocuments[0];
            setEditingDoc(docToEdit);
            setEditingPageCount(String(docToEdit.page_count || ""));
            setEditingReferenceCount(String(docToEdit.reference_count || ""));
          } else {
            setEditingDoc(null);
            setEditingPageCount("");
            setEditingReferenceCount("");
          }
        }
      };
      fetchDocuments();
    } else {
      setDocuments([]);
      setSelectedFile(null);
      setEditingDoc(null);
      setEditingPageCount("");
      setEditingReferenceCount("");
    }
  }, [episode, isOpen, supabase, toast]);

  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      setCategories(data || []);
    };
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen, supabase]);

  useEffect(() => {
    if (formData.category_id) {
      const loadSubcategories = async () => {
        const { data } = await supabase
          .from("subcategories")
          .select("*")
          .eq("category_id", formData.category_id)
          .order("name");
        setSubcategories(data || []);
      };
      loadSubcategories();
    } else {
      setSubcategories([]);
    }
  }, [formData.category_id, supabase]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: keyof Episode, value: string) => {
    const newFormData = { ...formData, [field]: value };
    if (field === "category_id") {
      newFormData.subcategory_id = null;
    }
    setFormData(newFormData);
  };

  const handleSaveChanges = async () => {
    if (!episode) return;
    setIsLoading(true);

    try {
      const { error: episodeError } = await supabase
        .from("episodes")
        .update({
          title: formData.title,
          description: formData.description,
          category_id: formData.category_id,
          subcategory_id: formData.subcategory_id,
        })
        .eq("id", episode.id);

      if (episodeError) throw episodeError;

      const { error: deleteTagsError } = await supabase
        .from("episode_tags")
        .delete()
        .eq("episode_id", episode.id);

      if (deleteTagsError) throw deleteTagsError;

      if (selectedTags.length > 0) {
        const newEpisodeTags = selectedTags.map((tag) => ({
          episode_id: episode.id,
          tag_id: tag.id,
        }));
        const { error: insertTagsError } = await supabase
          .from("episode_tags")
          .insert(newEpisodeTags);

        if (insertTagsError) throw insertTagsError;
      }

      // Save document metadata if it exists and has been edited
      if (editingDoc) {
        const { error: docError } = await supabase
          .from("episode_documents")
          .update({
            page_count: editingPageCount
              ? parseInt(editingPageCount, 10)
              : null,
            reference_count: editingReferenceCount
              ? parseInt(editingReferenceCount, 10)
              : null,
          })
          .eq("id", editingDoc.id);

        if (docError) throw docError;
      }

      toast({
        title: "Sucesso!",
        description: "Episódio e tags atualizados com sucesso.",
      });
      onEpisodeUpdate();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description:
          "Ocorreu um erro ao salvar as alterações. " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAttachDocument = async () => {
    if (!selectedFile || !episode) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("episode_id", episode.id);

    try {
      const response = await fetch("/api/episode-documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha no upload do arquivo.");
      }

      const newDocument = await response.json();
      setDocuments((prev) => [...prev, newDocument]);
      setSelectedFile(null);

      const fileInput = document.getElementById(
        "document-upload"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      toast({
        title: "Episode uploaded successfully!",
        description:
          "The episode has been uploaded and is ready to be processed.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to upload episode.",
        description:
          "An error occurred while uploading the episode. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (doc: EpisodeDocument) => {
    setDeletingId(doc.id);
    try {
      const response = await fetch("/api/delete-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileKey: doc.storage_path }),
      });

      if (!response.ok) {
        throw new Error("Falha ao deletar o arquivo do armazenamento.");
      }

      const { error: dbError } = await supabase
        .from("episode_documents")
        .delete()
        .eq("id", doc.id);

      if (dbError) {
        throw new Error("Falha ao deletar o registro do banco de dados.");
      }

      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      toast({
        title: "Sucesso!",
        description: "Documento removido com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  function handleDescriptionChange(markdown: string): void {
    setFormData((prev) => ({ ...prev, description: markdown }));
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 flex flex-col h-full max-h-[95vh]">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Editar Episódio</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="flex flex-col gap-6 p-6 pt-0">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={handleInputChange}
              />
            </div>

            {/* Categoria e Subcategoria lado a lado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={formData.category_id || ""}
                  onValueChange={(value) =>
                    handleSelectChange("category_id", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subcategoria</Label>
                <Select
                  value={formData.subcategory_id || ""}
                  onValueChange={(value) =>
                    handleSelectChange("subcategory_id", value)
                  }
                  disabled={!formData.category_id || subcategories.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma subcategoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label>Descrição</Label>
              <RichTextEditor
                content={formData.description || ""}
                onChange={handleDescriptionChange}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <TagSelector
                selectedTags={selectedTags}
                onSelectedTagsChange={setSelectedTags}
              />
            </div>

            {/* Documentos */}
            <div className="space-y-4 pt-6 border-t">
              <Label className="font-semibold text-base">
                Documento Anexado
              </Label>
              <div className="space-y-2">
                {documents.length > 0 ? (
                  documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 border rounded-lg space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm font-medium truncate">
                            {doc.file_name}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteDocument(doc)}
                          disabled={deletingId === doc.id}
                          className="flex-shrink-0"
                        >
                          {deletingId === doc.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-red-500" />
                          )}
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <Label htmlFor="editingPageCount">
                            Nº de Páginas
                          </Label>
                          <Input
                            id="editingPageCount"
                            type="number"
                            value={editingPageCount}
                            onChange={(e) =>
                              setEditingPageCount(e.target.value)
                            }
                            placeholder="Ex: 10"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="editingReferenceCount">
                            Nº de Referências
                          </Label>
                          <Input
                            id="editingReferenceCount"
                            type="number"
                            value={editingReferenceCount}
                            onChange={(e) =>
                              setEditingReferenceCount(e.target.value)
                            }
                            placeholder="Ex: 5"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Tamanho (MB)</Label>
                          <Input
                            type="text"
                            disabled
                            value={
                              doc.file_size
                                ? (doc.file_size / (1024 * 1024)).toFixed(2)
                                : "0.00"
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum documento anexado.
                  </p>
                )}
              </div>

              {/* Upload Form - Conditionally Rendered */}
              {documents.length < MAX_DOCUMENTS_PER_EPISODE && (
                <div className="flex items-center gap-2 pt-4 border-t">
                  <Input
                    id="document-upload"
                    type="file"
                    onChange={handleFileChange}
                    className="flex-grow"
                    accept=".pdf"
                  />
                  <Button
                    onClick={handleAttachDocument}
                    disabled={!selectedFile || isUploading}
                  >
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    <span className="ml-2 hidden sm:inline">
                      {isUploading ? "Enviando..." : "Anexar"}
                    </span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* RODAPÉ FIXO */}
        <DialogFooter className="p-6 pt-4 border-t">
          <Button
            type="button"
            onClick={handleSaveChanges}
            disabled={isLoading}
          >
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
