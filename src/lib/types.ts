// src/lib/types.ts

export interface Program {
  category: any; // TODO: tipar quando souber a estrutura exata
  id: string;
  title: string;
  description: string;
  category_id: string;
  created_at: string;
  updated_at: string;

  // Relacionamentos
  categories?: Category;
  episodes?: Episode[];
}

/**
 * Documento (opcional) de um episódio.
 */
export interface EpisodeDocument {
  id: string;
  episode_id: string;
  file_name: string;
  public_url: string;
  storage_path: string;
  created_at?: string;
  file_size?: number | null;
  page_count?: number | null;
  reference_count?: number | null;
}

/**
 * Tag de classificação.
 */
export interface Tag {
  id: string;
  name: string;
  created_at: string;
}

/**
 * Episódio.
 */
export interface Episode {
  id: string;
  title: string;
  description: string | null;
  audio_url: string;
  file_name: string;
  category_id: string | null;
  subcategory_id: string | null;
  status: "draft" | "scheduled" | "published";
  published_at: string;
  created_at: string;
  updated_at: string;
  duration_in_seconds: number | null;
  view_count: number;
  tags: Tag[];
  program_id: string | null;
  episode_number: number | null;

  categories?: { name: string } | null;
  subcategories?: { name: string } | null;
  programs?: Program | null;
  episode_documents?: EpisodeDocument[] | null;
}

/**
 * Categoria.
 */
export interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
  episode_count?: number;
  subcategories?: Subcategory[];
  subcategoriesLoading?: boolean;
}

/**
 * Subcategoria.
 */
export interface Subcategory {
  id: string;
  name: string;
  description: string;
  category_id: string;
  created_at: string;
  categories?: { name: string };
  episode_count?: number;
}

export type SortDirection = "asc" | "desc";
