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
import { Trash2, Edit } from "lucide-react";
import { Subcategory } from "@/src/lib/types";

interface SubcategoryActionsModalProps {
  subcategory: Subcategory | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (subcategoryId: string, newName: string) => Promise<void>;
  onDelete: (subcategoryId: string) => Promise<void>;
}

export function SubcategoryActionsModal({
  subcategory,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: SubcategoryActionsModalProps) {
  const [editName, setEditName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (subcategory) {
      setEditName(subcategory.name);
    } else {
      setEditName("");
    }
  }, [subcategory]);

  const handleSave = async () => {
    if (subcategory && editName.trim()) {
      setIsSaving(true);
      await onEdit(subcategory.id, editName.trim());
      setIsSaving(false);
      onClose();
    }
  };

  const handleDelete = async () => {
    if (subcategory) {
      setIsDeleting(true);
      await onDelete(subcategory.id);
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ações para a Subcategoria</AlertDialogTitle>
          <AlertDialogDescription>
            Edite o nome ou exclua a subcategoria &quot;{subcategory?.name}
            &quot;?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-subcategory-name">Nome da subcategoria:</Label>
            <Input
              id="edit-subcategory-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder={subcategory?.name}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving || isDeleting}
          >
            Cancelar
          </Button>
          <div className="flex space-x-2">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSaving || isDeleting}
              isLoading={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Excluir
            </Button>
            <Button
              onClick={handleSave}
              disabled={!editName.trim() || isSaving || isDeleting}
              isLoading={isSaving}
            >
              <Edit className="mr-2 h-4 w-4" /> Salvar Alterações
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
