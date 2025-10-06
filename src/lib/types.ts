// src/lib/types.ts

/**
 * Representa a estrutura de um programa.
 * ATUALIZADO para incluir o caminho da imagem de capa.
 */
export interface Program {
  category: any;
  id: string;
  title: string;
  description: string;
  category_id: string;
  created_at: string;
  updated_at: string;
  cover_image_path?: string | null; // <-- ADICIONE ESTA LINHA
  // Relacionamentos que o Supabase pode retornar
  categories?: Category;
  episodes?: Episode[];
}

/**
 * Representa a estrutura de um episódio.
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
  tags: any[];
  program_id: string | null;
  episode_number: number | null;
  // Relacionamentos que o Supabase pode retornar
  categories?: { name: string } | null;
  subcategories?: { name: string } | null;
  programs?: Program | null;
  episode_documents: EpisodeDocument[];
}

/**
 * Representa a estrutura de uma categoria.
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
 * Representa a estrutura de uma subcategoria.
 */
export type Subcategory = {
  id: string;
  name: string;
  description: string;
  category_id: string;
  created_at: string;
  categories?: { name: string };
  episode_count?: number;
};

/**
 * Representa a estrutura de uma tag.
 */
export type Tag = {
  id: string;
  name: string;
  created_at: string;
};

export type EpisodeDocument = {
  id: string;
  episode_id: string;
  file_name: string;
  public_url: string;
  storage_path: string;
  created_at: string;
  file_size: number | null;
  page_count: number | null;
  reference_count: number | null;
};

export type SortDirection = "asc" | "desc";
