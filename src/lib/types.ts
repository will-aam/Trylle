// src/lib/types.ts

/**
 * NOVO: Representa a estrutura de um programa.
 */
export interface Program {
  id: string;
  title: string;
  description: string;
  category_id: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos que o Supabase pode retornar
  categories?: Category;
  episodes?: Episode[];
}

/**
 * Representa a estrutura de um episódio.
 * ATUALIZADO para incluir a relação com Programas.
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
  tags: any[]; // Manter como 'any[]' por enquanto para evitar quebrar outras partes
  // NOVOS CAMPOS
  program_id: string | null; // Pode ser nulo para episódios antigos
  episode_number: number | null; // Pode ser nulo
  // Relacionamentos que o Supabase pode retornar
  categories?: { name: string } | null;
  subcategories?: { name: string } | null;
  programs?: Program | null;
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
