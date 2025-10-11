// src/app/admin/episodes/page.tsx

import React from "react";
import { EpisodeManager } from "@/src/components/features/admin/episode-management/episode-manager";
import { listEpisodesAction } from "./actions";
import { getAllTags } from "@/src/app/admin/tags/actions"; // Corrigido para a nova action de tags
import { getAllPrograms } from "@/src/app/admin/programs/actions"; // Corrigido para a nova action de programas
import { getAllCategoriesAndSubcategories } from "@/src/app/admin/categories/actions"; // Corrigido para a nova action de categorias

// A página agora é um Server Component assíncrono
export default async function AdminEpisodesPage() {
  // 1. Busca os dados da primeira página de episódios no servidor
  const initialEpisodesResult = await listEpisodesAction({
    page: 1,
    perPage: 10, // O valor inicial, o cliente pode alterar
    sortBy: "published_at",
    order: "desc",
  });

  // 2. Busca todos os dados de suporte (categorias, programas, tags)
  // Usamos Promise.all para buscar tudo em paralelo e otimizar o carregamento
  const [categoriesData, programs, allTags] = await Promise.all([
    getAllCategoriesAndSubcategories(),
    getAllPrograms(),
    getAllTags(),
  ]);

  // Tratamento de erro caso a busca inicial falhe
  if (!initialEpisodesResult.success) {
    return (
      <div className="text-red-500 p-4">
        Erro ao carregar os episódios: {initialEpisodesResult.error}
      </div>
    );
  }

  const initialData = {
    episodes: initialEpisodesResult.data,
    totalCount: initialEpisodesResult.totalFiltered,
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Gerenciador de Episódios
        </h1>
        <p className="text-muted-foreground mt-1">
          Adicione, edite e organize todo o seu conteúdo.
        </p>
      </header>

      {/* 3. Passa todos os dados carregados como props para o componente cliente */}
      <EpisodeManager
        initialData={initialData}
        categories={categoriesData.categories}
        subcategories={categoriesData.subcategories}
        programs={programs}
        allTags={allTags}
      />
    </div>
  );
}
