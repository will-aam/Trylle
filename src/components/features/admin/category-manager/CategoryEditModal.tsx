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
  const defaultValues = {
    name: category?.name ?? "",
    color_theme: (category as any)?.color_theme ?? null, // Preenche o seletor com o tema atual
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {category ? "Editar Categoria" : "Nova Categoria"}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <CategoryForm
            // key ajuda a resetar os valores quando a categoria mudar
            key={category?.id ?? "new"}
            onSubmit={onSubmit}
            defaultValues={defaultValues}
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
