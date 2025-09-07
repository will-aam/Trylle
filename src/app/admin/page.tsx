import { Suspense } from "react";
import { AdminStats } from "@/src/components/features/admin/admin-stats";
import { UploadForm } from "@/src/components/features/admin/admin-upload-form";
import { EpisodeManager } from "@/src/components/features/admin/episode-manager";
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="categories">Categories and Subs</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
          <TabsTrigger value="episodes">Episódios</TabsTrigger>
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

        <TabsContent value="episodes">
          <EpisodeManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
