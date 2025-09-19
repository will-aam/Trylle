"use client";

import { useState } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { CloseButton } from "@/src/components/ui/close-button";
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
import { Pencil, Trash2, AlertCircle } from "lucide-react";
import { Subcategory } from "@/src/lib/types";

interface SubcategoryActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subcategory: Subcategory | null;
  onEdit: (subcategoryId: string, newName: string) => void;
  onDelete: (subcategoryId: string) => void;
}

export function SubcategoryActionsModal({
  isOpen,
  onClose,
  subcategory,
  onEdit,
  onDelete,
}: SubcategoryActionsModalProps) {
  const [editingName, setEditingName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    if (subcategory && editingName.trim()) {
      onEdit(subcategory.id, editingName.trim());
      setEditingName("");
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (subcategory) {
      onDelete(subcategory.id);
    }
  };

  const startEditing = () => {
    if (subcategory) {
      setEditingName(subcategory.name);
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingName("");
  };

  if (!isOpen || !subcategory) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-background rounded-lg shadow-lg p-6 w-full max-w-md">
        <CloseButton onClick={onClose} className="absolute top-4 right-4" />
        <h2 className="text-lg font-semibold mb-4">Gerenciar Subcategoria</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Nome da Subcategoria
          </label>
          {isEditing ? (
            <Input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEdit();
                if (e.key === "Escape") cancelEditing();
              }}
              autoFocus
            />
          ) : (
            <div className="flex items-center justify-between bg-muted rounded-md px-3 py-2">
              <span>{subcategory.name}</span>
              <span className="text-sm text-muted-foreground">
                ({subcategory.episode_count})
              </span>
            </div>
          )}
        </div>

        {subcategory.episode_count === 0 && (
          <div className="mb-4 text-yellow-600 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">
              Esta subcategoria não tem episódios associados.
            </span>
          </div>
        )}

        <div className="flex justify-between">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={cancelEditing}>
                Cancelar
              </Button>
              <Button onClick={handleEdit}>Salvar</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={startEditing}>
                <Pencil className="mr-2 h-4 w-4" /> Editar
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso excluirá
                      permanentemente a subcategoria "{subcategory.name}".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
