"use client";
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Trash2, Edit } from "lucide-react";
import { TagWithCount } from "./types";

// Adicionamos a definição para TagGroup aqui
type TagGroup = {
  id: string;
  name: string;
};

interface TagActionsDialogProps {
  tag: TagWithCount | null;
  isOpen: boolean;
  onClose: () => void;
  // A função onEdit agora também aceitará o ID do grupo
  onEdit: (tagId: string, newName: string, groupId: string | null) => void;
  onDelete: (tagId: string) => void;
  // Passaremos a lista de grupos disponíveis como uma propriedade
  tagGroups: TagGroup[];
}

export function TagActionsDialog({
  tag,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  tagGroups = [], // Adicione = [] aqui
}: TagActionsDialogProps) {
  const [editName, setEditName] = useState("");
  // Novo estado para guardar o ID do grupo selecionado
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Efeito para preencher os campos quando o diálogo abre
  useEffect(() => {
    if (tag) {
      setEditName(tag.name);
      setSelectedGroupId(tag.group_id || null);
    } else {
      setEditName("");
      setSelectedGroupId(null);
    }
  }, [tag]);

  const handleSave = () => {
    if (tag && editName.trim()) {
      // Passamos o ID do grupo selecionado ao salvar
      onEdit(tag.id, editName.trim(), selectedGroupId);
      onClose();
    }
  };

  const handleDelete = () => {
    if (tag) {
      onDelete(tag.id);
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ações para a Tag</AlertDialogTitle>
          <AlertDialogDescription>
            Edite o nome, atribua a um grupo ou exclua a tag "{tag?.name}"
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-tag-name">Nome da tag:</Label>
            <Input
              id="edit-tag-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder={tag?.name}
            />
          </div>

          {/* Novo Bloco: Seletor de Grupo */}
          <div className="space-y-2">
            <Label htmlFor="tag-group">Grupo (Opcional)</Label>
            <Select
              value={selectedGroupId || "none"}
              onValueChange={(value) => {
                setSelectedGroupId(value === "none" ? null : value);
              }}
            >
              <SelectTrigger id="tag-group">
                <SelectValue placeholder="Selecione um grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum grupo</SelectItem>
                {tagGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <div className="flex space-x-2">
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" /> Excluir
            </Button>
            <Button onClick={handleSave} disabled={!editName.trim()}>
              <Edit className="mr-2 h-4 w-4" /> Salvar Alterações
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
