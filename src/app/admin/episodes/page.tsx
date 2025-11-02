// src/app/admin/episodes/page.tsx
import React from "react";
import { EpisodeManager } from "@/src/components/features/admin/episode-management/episode-manager";
import { listEpisodesAction } from "./actions";
import { getAllTags } from "@/src/app/admin/tags/actions";
import { getAllPrograms } from "@/src/app/admin/programs/actions";
import { getAllCategoriesAndSubcategories } from "@/src/app/admin/categories/actions";
import { Tag } from "@/src/lib/types";

export default async function AdminEpisodesPage() {
  const initialEpisodesResult = await listEpisodesAction({
    page: 1,
    perPage: 10,
    sortBy: "published_at",
    order: "desc",
  });

  const [categoriesData, programs, allTagsResult] = await Promise.all([
    getAllCategoriesAndSubcategories(),
    getAllPrograms(),
    getAllTags(),
  ]);

  if (!initialEpisodesResult.success) {
    return (
      <div className="text-red-500 p-4">
        Erro ao carregar os episódios: {initialEpisodesResult.error}
      </div>
    );
  }

  const allTagsList: Tag[] = allTagsResult.success ? allTagsResult.tags : [];

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
      </header>

      <EpisodeManager
        initialData={initialData}
        categories={categoriesData.categories}
        subcategories={categoriesData.subcategories}
        programs={programs}
        allTags={allTagsList}
      />
    </div>
  );
}
