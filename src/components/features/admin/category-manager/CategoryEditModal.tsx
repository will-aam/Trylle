// src/components/features/admin/category-manager/CategoryEditModal.tsx
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
  // A função de submit recebe os dados do formulário e o ID (para edições)
  onSubmit: (data: CategoryFormData & { id?: string }) => void;
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
  };

  // Prepara os dados para o submit, incluindo o ID se for uma edição
  const handleSubmit = (data: CategoryFormData) => {
    onSubmit({
      ...data,
      id: category?.id, // Será `undefined` ao criar uma nova categoria
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {category ? "Editar Categoria" : "Nova Categoria"}
          </DialogTitle>
          {!category && (
            <DialogDescription>
              Preencha os dados para criar uma nova categoria.
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="py-4">
          <CategoryForm
            // A chave `key` ajuda o React a resetar o formulário quando a categoria muda
            key={category?.id ?? "new"}
            onSubmit={handleSubmit}
            defaultValues={defaultValues}
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
