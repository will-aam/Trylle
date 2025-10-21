import { useState, FormEvent } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

interface TagFormProps {
  newTagName: string;
  onTagNameChange: (value: string) => void;
  onAddTag: () => void | Promise<void>;
  unusedTagCount: number;
  onDeleteUnusedTags: () => void | Promise<void>;
  disabled?: boolean; // ADICIONADO
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
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 w-full"
      role="form"
    >
      <div className="flex gap-2">
        <Input
          value={newTagName}
          onChange={(e) => onTagNameChange(e.target.value)}
          placeholder="Nova tag..."
          disabled={disabled}
        />
        <Button type="submit" disabled={disabled || !newTagName.trim()}>
          Adicionar
        </Button>
      </div>
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onDeleteUnusedTags()}
          disabled={disabled || unusedTagCount === 0}
        >
          Limpar não usadas
        </Button>
      </div>
    </form>
  );
}
