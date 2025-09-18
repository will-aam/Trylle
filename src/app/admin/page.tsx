import { Suspense } from "react";
import { AdminStats } from "@/src/components/features/admin/admin-stats";
import { UploadForm } from "@/src/components/features/admin/admin-upload-form";
import { CategoryManager } from "@/src/components/features/admin/category-manager/index";
import { TagManager } from "@/src/components/features/admin/tag-manager/TagManager";
import { TagGroupManager } from "@/src/components/features/admin/tag-group-manager/TagGroupManager";
import { TagAliasManager } from "@/src/components/features/admin/tag-alias-manager/TagAliasManager";
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="categories">Categorias e Subs</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
          <TabsTrigger value="tag-groups">Grupos de Tags</TabsTrigger>
          <TabsTrigger value="tag-aliases">Sinônimos</TabsTrigger>
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

        <TabsContent value="tag-groups">
          <TagGroupManager />
        </TabsContent>

        <TabsContent value="tag-aliases">
          <TagAliasManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
