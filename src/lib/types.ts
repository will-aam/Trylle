export type Episode = {
  imageUrl: string;
  id: string;
  title: string;
  description: string | null;
  audio_url: string;
  file_name: string;
  category_id: string | null;
  subcategory_id: string | null;
  // AQUI ESTÁ A CORREÇÃO: Adicionamos 'publicado' como um tipo válido
  status: "published" | "draft" | "scheduled" | "archived" | "publicado";
  tags: any[]; // Usando 'any[]' para acomodar a estrutura aninhada por enquanto
  published_at: string;
  created_at: string;
  updated_at: string;
  // Propriedades opcionais para quando fazemos JOIN com outras tabelas
  categories?: { name: string } | null;
  subcategories?: { name: string } | null;
};

/**
 * Representa a estrutura de uma categoria.
 */
export type Category = {
  description: string;
  id: string;
  name: string;
  created_at: string;
};

/**
 * Representa a estrutura de uma subcategoria.
 */
export type Subcategory = {
  description: string;
  id: string;
  name: string;
  category_id: string;
  created_at: string;
  categories?: { name: string };
};

/**
 * NOVO: Representa a estrutura de uma tag,
 * alinhada com a nova tabela 'tags'.
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
  // Renomeado para public_url para consistência com o que a API retorna
  public_url: string;
  // Renomeado para storage_path para consistência
  storage_path: string;
  created_at: string;
};
