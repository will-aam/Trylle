"use client";

import { Subcategory } from "@/src/lib/types";
import { AlertCircle } from "lucide-react";

interface SubcategoryItemProps {
  subcategory: Subcategory;
  onEdit: (subcategory: Subcategory) => void;
}

export function SubcategoryItem({ subcategory, onEdit }: SubcategoryItemProps) {
  return (
    <div
      className="bg-background rounded-md p-2 text-sm font-medium cursor-pointer hover:bg-accent transition-colors border flex justify-center items-center gap-2"
      onClick={() => onEdit(subcategory)}
    >
      <span>
        {subcategory.name} ({subcategory.episode_count})
      </span>
      {subcategory.episode_count === 0 && (
        <AlertCircle className="h-4 w-4 text-yellow-500" />
      )}
    </div>
  );
}
