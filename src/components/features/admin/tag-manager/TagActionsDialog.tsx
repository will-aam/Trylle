"use client";
import { useState } from "react";
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
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Trash2, Edit } from "lucide-react";
import { TagWithCount } from "./types";

interface TagActionsDialogProps {
  tag: TagWithCount | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (tagId: string, newName: string) => void;
  onDelete: (tagId: string) => void;
}

export function TagActionsDialog({
  tag,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: TagActionsDialogProps) {
  const [editName, setEditName] = useState("");

  const handleSave = () => {
    if (tag && editName.trim()) {
      onEdit(tag.id, editName.trim());
      setEditName("");
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
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Ações para a Tag</AlertDialogTitle>
          <AlertDialogDescription>
            Escolha o que você deseja fazer com a tag "{tag?.name}"
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="edit-tag-name" className="text-sm font-medium">
              Novo nome da tag:
            </label>
            <Input
              id="edit-tag-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder={tag?.name}
              className="w-full"
            />
          </div>
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={onClose} className="px-4 py-2">
              Cancelar
            </Button>
            <div className="flex space-x-2">
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="px-4 py-2"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  !editName.trim() ||
                  editName.trim().toLowerCase() === tag?.name?.toLowerCase()
                }
                className="px-4 py-2"
              >
                <Edit className="mr-2 h-4 w-4" /> Salvar Alterações
              </Button>
            </div>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
