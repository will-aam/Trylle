// components/tag-manager/types.ts

import { Tag } from "@/src/lib/types";

/**
 * Representa uma tag com a contagem de episódios associados.
 * Estende o tipo Tag base, adicionando a propriedade episode_count.
 */
export type TagWithCount = Tag & {
  episode_count: number;
  group_id?: string | null;
};

/**
 * Tipos para os modos de filtro de tags
 */
export type FilterMode = "all" | "used" | "unused";

/**
 * Interface para as propriedades do componente TagItem
 */
export interface TagItemProps {
  tag: TagWithCount;
  onEdit: (tag: TagWithCount) => void;
}

/**
 * Interface para as propriedades do componente TagActionsDialog
 */
export interface TagActionsDialogProps {
  tag: TagWithCount | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (tagId: string, newName: string) => void;
  onDelete: (tagId: string) => void;
}

/**
 * Representa um grupo de tags.
 */
export type TagGroup = {
  id: string;
  name: string;
};
