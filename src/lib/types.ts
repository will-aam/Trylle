// src/lib/types.ts

/**
 * Representa a estrutura de um único episódio,
 * alinhada com a tabela 'episodes' no banco de dados.
 */
export type Episode = {
  id: string;
  title: string;
  description: string | null;
  audio_url: string;
  file_name: string;
  category_id: string | null;
  subcategory_id: string | null;
  tags: string[] | null;
  published_at: string;
  created_at: string;
  updated_at: string;
  // Propriedades opcionais para quando fazemos JOIN com outras tabelas
  categories?: { name: string } | null;
  subcategories?: { name: string } | null;
};

/**
 * Representa a estrutura de uma categoria,
 * alinhada com a tabela 'categories'.
 */
export type Category = {
  id: string;
  name: string;
  created_at: string;
};

/**
 * Representa a estrutura de uma subcategoria,
 * alinhada com a tabela 'subcategories'.
 */
export type Subcategory = {
  id: string;
  name: string;
  category_id: string;
  created_at: string;
  // Propriedade opcional para JOIN
  categories?: { name: string };
};
