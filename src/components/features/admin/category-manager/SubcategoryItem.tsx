"use client";

import { Subcategory } from "@/src/lib/types";

// A prop aqui deve se chamar 'onEdit' para corresponder ao que o CategoryItem está passando.
interface SubcategoryItemProps {
  subcategory: Subcategory;
  onEdit: (subcategory: Subcategory) => void;
}

export function SubcategoryItem({ subcategory, onEdit }: SubcategoryItemProps) {
  return (
    <div
      className="bg-background rounded-md p-2 text-sm font-medium cursor-pointer hover:bg-accent transition-colors border flex justify-center items-center gap-2"
      // A função onEdit é chamada quando o item é clicado
      onClick={() => onEdit(subcategory)}
    >
      <span>
        {subcategory.name} ({subcategory.episode_count})
      </span>
      {/* O ÍCONE AMARELO FOI REMOVIDO DAQUI */}
    </div>
  );
}
