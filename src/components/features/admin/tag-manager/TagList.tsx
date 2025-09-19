"use client";
import { TagWithCount, FilterMode } from "./types";
import { TagItem } from "./TagItem";
import { Skeleton } from "@/src/components/ui/skeleton";

interface TagListProps {
  tags: TagWithCount[];
  loading: boolean;
  filterMode: FilterMode;
  selectedTags: TagWithCount[];
  onTagSelect: (tag: TagWithCount) => void;
  setSelectedTag: (tag: TagWithCount | null) => void;
  onDeleteTag: (tagId: string) => void;
}

export function TagList({
  tags,
  loading,
  filterMode,
  selectedTags,
  onTagSelect,
  setSelectedTag,
  onDeleteTag,
}: TagListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
        {Array.from({ length: 15 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Nenhuma tag encontrada para o filtro selecionado.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
      {tags.map((tag) => (
        <TagItem
          key={tag.id}
          tag={tag}
          isSelected={selectedTags.some((t) => t.id === tag.id)}
          onSelect={onTagSelect}
          onTagAction={setSelectedTag}
          onDelete={onDeleteTag}
        />
      ))}
    </div>
  );
}
