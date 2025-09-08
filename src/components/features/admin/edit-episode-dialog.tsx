"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { useToast } from "@/src/hooks/use-toast";
import { createClient } from "@/src/lib/supabase-client";
import { Episode, Category, Subcategory } from "@/src/lib/types";
import { File, Trash2, Upload } from "lucide-react";

// + Definir o tipo para os documentos do episódio
type EpisodeDocument = {
  id: string;
  episode_id: string;
  file_name: string;
  file_url: string;
  file_key: string;
  created_at: string;
};

// Tipos para as propriedades que o componente receberá
interface EditEpisodeDialogProps {
  episode: Episode | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onEpisodeUpdate: () => void; // Função para recarregar a lista de episódios
}

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
  // + Estados para gerenciar documentos
  const [documents, setDocuments] = useState<EpisodeDocument[]>([]);
  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Carrega os dados do episódio e seus documentos
  useEffect(() => {
    if (episode && isOpen) {
      setFormData({
        title: episode.title,
        description: episode.description,
        category_id: episode.category_id,
        subcategory_id: episode.subcategory_id,
      });

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
          setDocuments(data || []);
        }
      };
      fetchDocuments();
    } else {
      // Limpa os estados ao fechar o modal
      setDocuments([]);
      setSelectedFile(null);
    }
  }, [episode, isOpen, supabase, toast]);

  // Carrega as categorias e subcategorias para os menus de seleção
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

    const { error } = await supabase
      .from("episodes")
      .update({
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id,
        subcategory_id: formData.subcategory_id,
      })
      .eq("id", episode.id);

    if (error) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso!",
        description: "Episódio atualizado com sucesso.",
      });
      onEpisodeUpdate();
      onOpenChange(false);
    }
    setIsLoading(false);
  };

  // + Lógica para anexo de documento
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
      setSelectedFile(null); // Limpa o input
      // Resetar o valor do input de arquivo para permitir selecionar o mesmo arquivo novamente
      const fileInput = document.getElementById(
        "document-upload"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      toast({
        title: "Sucesso!",
        description: "Documento anexado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro no anexo",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // + Lógica para exclusão de documento
  const handleDeleteDocument = async (doc: EpisodeDocument) => {
    setDeletingId(doc.id);
    try {
      // 1. Deletar do R2
      const response = await fetch("/api/delete-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileKey: doc.file_key }),
      });

      if (!response.ok) {
        throw new Error("Falha ao deletar o arquivo do armazenamento.");
      }

      // 2. Deletar do Supabase
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Episódio</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Formulário de Edição do Episódio */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Título
            </Label>
            <Input
              id="title"
              value={formData.title || ""}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              className="col-span-3"
              rows={5}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category_id" className="text-right">
              Categoria
            </Label>
            <Select
              value={formData.category_id || ""}
              onValueChange={(value) =>
                handleSelectChange("category_id", value)
              }
            >
              <SelectTrigger className="col-span-3">
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subcategory_id" className="text-right">
              Subcategoria
            </Label>
            <Select
              value={formData.subcategory_id || ""}
              onValueChange={(value) =>
                handleSelectChange("subcategory_id", value)
              }
              disabled={!formData.category_id || subcategories.length === 0}
            >
              <SelectTrigger className="col-span-3">
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

          {/* Seção de Documentos */}
          <div className="col-span-4 space-y-4 pt-4 border-t">
            <Label className="font-semibold">Documentos Anexados</Label>
            <div className="space-y-2">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{doc.file_name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteDocument(doc)}
                      disabled={deletingId === doc.id}
                    >
                      {deletingId === doc.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum documento anexado.
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Input
                id="document-upload"
                type="file"
                onChange={handleFileChange}
                className="flex-grow"
                accept=".pdf" // Aceita apenas PDFs como exemplo
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
                <span className="ml-2">
                  {isUploading ? "Enviando..." : "Anexar"}
                </span>
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
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
