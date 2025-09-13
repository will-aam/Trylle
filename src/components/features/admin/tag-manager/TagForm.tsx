"use client";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Plus } from "lucide-react";

interface TagFormProps {
  newTagName: string;
  onTagNameChange: (value: string) => void;
  onAddTag: () => void;
}

export function TagForm({
  newTagName,
  onTagNameChange,
  onAddTag,
}: TagFormProps) {
  return (
    <div className="flex space-x-2">
      <Input
        placeholder="Nome da nova tag"
        value={newTagName}
        onChange={(e) => onTagNameChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onAddTag()}
      />
      <Button onClick={onAddTag}>
        <Plus className="mr-2 h-4 w-4" /> Adicionar
      </Button>
    </div>
  );
}
