"use client";

import { ControllerRenderProps } from "react-hook-form";
import { Tag } from "@/src/lib/types";
import { TagSelector } from "@/src/components/features/admin/TagSelector";

interface TagsFieldProps {
  allTags: Tag[];
  field: ControllerRenderProps<any, "tags">;
}

export function TagsField({ allTags, field }: TagsFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Tags</label>
      <TagSelector
        tags={allTags}
        selectedTags={allTags.filter((t) => field.value?.includes(t.id))}
        onSelectedTagsChange={(tags) => field.onChange(tags.map((t) => t.id))}
      />
    </div>
  );
}
