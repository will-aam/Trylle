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
import { createClient } from "@/src/lib/supabase-client";
import { getUserCount } from "./actions";

async function getStats() {
  const supabase = createClient();
  const { count: episodeCount, error: episodeError } = await supabase
    .from("episodes")
    .select("*", { count: "exact", head: true });

  if (episodeError) {
    console.error("Error fetching episode count:", episodeError);
  }

  const userCount = await getUserCount();

  return {
    episodeCount: episodeCount ?? 0,
    userCount: userCount ?? 0,
  };
}

export default async function AdminPage() {
  const { episodeCount, userCount } = await getStats();
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense
        fallback={
          <div className="animate-pulse bg-muted h-32 rounded-lg mb-8" />
        }
      >
        <AdminStats episodeCount={episodeCount} userCount={userCount} />
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
