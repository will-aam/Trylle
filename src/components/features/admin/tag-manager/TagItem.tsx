"use client";
import { TagWithCount } from "@/src/components/features/admin/tag-manager/types";
import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface TagItemProps {
  tag: TagWithCount;
  isSelected: boolean;
  onSelect: (tag: TagWithCount) => void;
  onTagAction: (tag: TagWithCount) => void; // Nova prop
}

export function TagItem({
  tag,
  isSelected,
  onSelect,
  onTagAction,
}: TagItemProps) {
  return (
    <div className="group relative p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
      <Badge
        variant="secondary"
        className={cn(
          "w-full justify-start cursor-pointer hover:bg-destructive/80 transition-colors active:bg-transparent active:scale-95",
          {
            "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300":
              tag.episode_count === 0,
          },
          isSelected &&
            "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200"
        )}
        onClick={() => onSelect(tag)}
      >
        <div className="flex items-center justify-between w-full">
          <span className="truncate">{tag.name}</span>
          <span className="text-xs opacity-70 ml-2">({tag.episode_count})</span>
        </div>
      </Badge>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation(); // Impede que o clique afete a tag
          onTagAction(tag); // Usa a prop passada do pai
        }}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-muted hover:text-foreground"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </div>
  );
}
