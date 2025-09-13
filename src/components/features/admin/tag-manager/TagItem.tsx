"use client";
import { Badge } from "@/src/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { TagWithCount } from "./types";
import { cn } from "@/src/lib/utils";

interface TagItemProps {
  tag: TagWithCount;
  onEdit: (tag: TagWithCount) => void;
}

export function TagItem({ tag, onEdit }: TagItemProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge
            variant="secondary"
            className={cn(
              "cursor-pointer hover:bg-destructive/80 transition-colors",
              {
                "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300":
                  tag.episode_count === 0,
              }
            )}
            onClick={() => onEdit(tag)}
          >
            {tag.name} ({tag.episode_count})
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Clique para editar ou excluir esta tag</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
