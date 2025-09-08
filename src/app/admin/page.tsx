import { Suspense } from "react";
import { AdminStats } from "@/src/components/features/admin/admin-stats";
import { UploadForm } from "@/src/components/features/admin/admin-upload-form";
// O EpisodeManager não é mais necessário aqui
import { CategoryManager } from "@/src/components/features/admin/category-manager";
import { TagManager } from "@/src/components/features/admin/tag-manager";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense
        fallback={
          <div className="animate-pulse bg-muted h-32 rounded-lg mb-8" />
        }
      >
        <AdminStats />
      </Suspense>

      <Tabs defaultValue="upload" className="space-y-6">
        {/* --- GRADE AJUSTADA PARA 3 COLUNAS --- */}
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="categories">Categorias e Subs</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
          {/* --- ABA DE EPISÓDIOS REMOVIDA --- */}
        </TabsList>

        <TabsContent value="upload">
          <UploadForm />
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManager />
        </TabsContent>

        <TabsContent value="tags">
          <TagManager />
        </TabsContent>

        {/* --- CONTEÚDO DA ABA DE EPISÓDIOS REMOVIDO --- */}
      </Tabs>
    </div>
  );
}
