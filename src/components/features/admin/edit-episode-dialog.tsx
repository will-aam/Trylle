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
import { Episode, Category, Subcategory, Tag } from "@/src/lib/types";

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

  // Carrega os dados do episódio no formulário sempre que um novo episódio é selecionado
  useEffect(() => {
    if (episode) {
      setFormData({
        title: episode.title,
        description: episode.description,
        category_id: episode.category_id,
        subcategory_id: episode.subcategory_id,
      });
    }
  }, [episode]);

  // Carrega as categorias e subcategorias para os menus de seleção
  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      setCategories(data || []);
    };
    loadCategories();
  }, [supabase]);

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
      newFormData.subcategory_id = null; // Reseta a subcategoria ao mudar a categoria
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
      onEpisodeUpdate(); // Chama a função para recarregar a lista na página principal
      onOpenChange(false); // Fecha o modal
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Episódio</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
