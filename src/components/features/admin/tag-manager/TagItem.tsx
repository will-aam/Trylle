// src/components/features/admin/tag-manager/TagItem.tsx
"use client";

import { cn } from "@/src/lib/utils";
import { TagWithCount } from "./types";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Button } from "@/src/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { Pencil } from "lucide-react";
import { useState } from "react";

interface TagItemProps {
  tag: TagWithCount;
  isSelected: boolean;
  onSelect: (tag: TagWithCount) => void;
  onTagAction: (tag: TagWithCount) => void;
}

export function TagItem({
  tag,
  isSelected,
  onSelect,
  onTagAction,
}: TagItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TooltipProvider delayDuration={100}>
      <div
        className={cn(
          "relative group flex items-center justify-between gap-2 p-1 pl-2 pr-1 rounded-full border transition-all duration-200",
          isSelected
            ? "bg-blue-800 border-blue-300 shadow-sm"
            : "bg-background border-border hover:bg-muted/80 hover:border-muted-foreground/20",
          tag.episode_count === 0 && !isSelected
            ? "border-red-200/80 hover:border-red-300"
            : ""
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-2 flex-1 truncate">
          <Checkbox
            id={`tag-${tag.id}`}
            checked={isSelected}
            onCheckedChange={() => onSelect(tag)}
            className={cn(
              "transition-opacity duration-200",
              !isSelected && !isHovered ? "opacity-0" : "opacity-100"
            )}
          />
          <label
            htmlFor={`tag-${tag.id}`}
            className="text-sm font-medium truncate cursor-pointer"
          >
            {tag.name}
          </label>
        </div>

        <div className="flex items-center">
          <span
            className={cn(
              "text-xs font-semibold tabular-nums rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center transition-colors",
              isSelected
                ? "bg-blue-600 text-white"
                : "bg-muted text-muted-foreground",
              tag.episode_count === 0 && !isSelected
                ? "bg-red-500/80 text-white"
                : ""
            )}
          >
            {tag.episode_count}
          </span>
          <div
            className={cn(
              "transition-all duration-200 ease-in-out overflow-hidden flex items-center",
              isHovered || isSelected
                ? "max-w-[40px] opacity-100"
                : "max-w-0 opacity-0"
            )}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={() => onTagAction(tag)}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit Tag</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
