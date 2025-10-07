"use client";

import { ControllerRenderProps } from "react-hook-form";
import { Tag } from "@/src/lib/types";
import { TagSelector } from "@/src/components/features/admin/TagSelector";

interface TagsFieldProps {
  allTags: Tag[];
  field: ControllerRenderProps<any, "tags">;
  /**
   * Callback opcional quando uma nova tag é criada no selector.
   */
  onCreateTag?: (tag: Tag) => void;
  /**
   * Placeholder opcional para o componente.
   */
  placeholder?: string;
}

export function TagsField({
  allTags,
  field,
  onCreateTag,
  placeholder = "Selecione ou crie tags...",
}: TagsFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Tags</label>
      <TagSelector
        allTags={allTags}
        value={field.value ?? []} // field.value deve ser string[] (ids)
        onChange={(ids) => field.onChange(ids)} // garante passagem direta
        onCreateTag={onCreateTag}
        placeholder={placeholder}
      />
    </div>
  );
}
