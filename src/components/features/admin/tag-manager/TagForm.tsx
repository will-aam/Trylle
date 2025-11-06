// src/components/features/admin/tag-manager/TagForm.tsx

import { useState, FormEvent } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Trash } from "lucide-react";

interface TagFormProps {
  newTagName: string;
  onTagNameChange: (value: string) => void;
  onAddTag: () => void | Promise<void>;
  unusedTagCount: number;
  onDeleteUnusedTags: () => void | Promise<void>;
  disabled?: boolean;
}

export function TagForm({
  newTagName,
  onTagNameChange,
  onAddTag,
  unusedTagCount,
  onDeleteUnusedTags,
  disabled = false,
}: TagFormProps) {
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    await onAddTag();
  };

  return (
    // O formulário continua sendo uma linha flexível
    <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
      <Input
        value={newTagName}
        onChange={(e) => onTagNameChange(e.target.value)}
        placeholder="Nova tag..."
        disabled={disabled}
        // MUDANÇA AQUI: Removido "w-full" e adicionado "flex-1"
        className="flex-1 flex-shrink-0"
      />
      <Button type="submit" disabled={disabled || !newTagName.trim()}>
        Adicionar
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onDeleteUnusedTags()}
        disabled={disabled || unusedTagCount === 0}
        className="text-red-500 hover:text-red-600 hover:bg-transparent"
        title="Limpar tags não utilizadas"
      >
        <Trash className="h-4 w-4" />
        <span className="sr-only">Limpar tags não utilizadas</span>
      </Button>
    </form>
  );
}
