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
  cover_image_path?: string | null;
  // Relacionamentos
  categories?: Category;
  episodes?: Episode[];
}

/**
 * Representa a estrutura de um documento de episódio.
 * Tornamos campos opcionais porque nem sempre o documento existe
 * ou algumas colunas podem não ser retornadas em todos os selects.
 */
export interface EpisodeDocument {
  id: string;
  episode_id: string;
  file_name: string;
  public_url: string;
  storage_path: string;
  created_at?: string; // Agora opcional
  file_size?: number | null;
  page_count?: number | null;
  reference_count?: number | null;
}

/**
 * Representa a estrutura de uma tag.
 * (Se você quiser vincular metadados extras, expanda aqui)
 */
export interface Tag {
  id: string;
  name: string;
  created_at: string;
}

/**
 * Representa a estrutura de um episódio.
 * Ajustes:
 * - category_id pode ser null (mantido)
 * - episode_documents agora opcional (ou pode ser null) para refletir ausência de documento.
 * - tags tipado como Tag[] (se o backend às vezes retorna só ids, ajuste para (Tag | string)[] ou mantenha any[]).
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
  tags: Tag[] | any[]; // Ajuste para Tag[] se garantir formato consistente
  program_id: string | null;
  episode_number: number | null;
  // Relacionamentos (podem não vir em todas as queries)
  categories?: { name: string } | null;
  subcategories?: { name: string } | null;
  programs?: Program | null;
  episode_documents?: EpisodeDocument[] | null; // <- Tornado opcional/null
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
