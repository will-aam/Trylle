"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { CategoryForm } from "./CategoryForm";
import { Category } from "@/src/lib/types";
import { CategoryFormData } from "@/src/lib/schemas";

interface CategoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => void;
  category: Category | null;
  isLoading?: boolean;
}

export function CategoryEditModal({
  isOpen,
  onClose,
  onSubmit,
  category,
  isLoading,
}: CategoryEditModalProps) {
  const defaultValues = category ? { name: category.name } : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {category ? "Editar Categoria" : "Nova Categoria"}
          </DialogTitle>
          <DialogDescription>
            {category
              ? "Edite as informações da sua categoria."
              : "Preencha os dados para criar uma nova categoria."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <CategoryForm
            onSubmit={onSubmit}
            defaultValues={defaultValues}
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
