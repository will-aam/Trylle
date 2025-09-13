"use client";
import { TagWithCount } from "./types";
import { TagItem } from "./TagItem";
import { Skeleton } from "@/src/components/ui/skeleton";
import { cn } from "@/src/lib/utils";

interface TagListProps {
  tags: TagWithCount[];
  loading: boolean;
  onEdit: (tag: TagWithCount) => void;
  emptyMessage?: string;
}

export function TagList({ tags, loading, onEdit, emptyMessage }: TagListProps) {
  if (loading) {
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 15 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-24 rounded-full" />
        ))}
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <p
        className={cn(
          "text-sm text-muted-foreground text-center py-4",
          emptyMessage && "text-foreground"
        )}
      >
        {emptyMessage || "Nenhuma tag encontrada para o filtro selecionado."}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <TagItem key={tag.id} tag={tag} onEdit={onEdit} />
      ))}
    </div>
  );
}
