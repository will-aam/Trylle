import { EpisodeManager } from "@/src/components/features/admin/episode-manager";
import { Suspense } from "react";

export default function AdminEpisodesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<p>Carregando gerenciador de episódios...</p>}>
        <EpisodeManager />
      </Suspense>
    </div>
  );
}
