"use client";

import { AudioLines, ListMinus, Play, Podcast } from "lucide-react";
import { Button } from "@/src/components/ui/button";

// Tipagem para uma playlist
type Playlist = {
  id: number;
  title: string;
  totalDuration: string;
  color: string;
  coverImage?: string;
};

// Dados das playlists recentes
const recentPlaylists: Playlist[] = [
  {
    id: 1,
    title: "Desenvolvimento Pessoal",
    totalDuration: "8h 45min",
    color: "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600",
  },
  {
    id: 2,
    title: "Tecnologia & Inovação",
    totalDuration: "6h 20min",
    color: "bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600",
  },
  {
    id: 3,
    title: "Filosofia Moderna",
    totalDuration: "4h 15min",
    color: "bg-gradient-to-br from-orange-500 via-red-500 to-pink-500",
  },
  {
    id: 4,
    title: "Direito & Sociedade",
    totalDuration: "12h 30min",
    color: "bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600",
  },
  {
    id: 5,
    title: "Espiritualidade",
    totalDuration: "5h 45min",
    color: "bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-600",
  },
  {
    id: 6,
    title: "Marketing & Vendas",
    totalDuration: "7h 10min",
    color: "bg-gradient-to-br from-pink-500 via-rose-600 to-red-600",
  },
];

// ✅ CARD ATUALIZADO COM HOVER SUAVE E RESPONSIVIDADE
function PlaylistCard({
  playlist,
  onClick,
}: {
  playlist: Playlist;
  onClick: () => void;
}) {
  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-white/20 bg-white/10 p-2 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:bg-white/20 hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:border-white/20 sm:p-4"
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-pink-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10 flex items-center gap-2">
        <div
          className={`relative flex-none h-8 w-8 shrink-0 overflow-hidden rounded-lg ${playlist.color} flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 sm:h-12 sm:w-12`}
        >
          <div className="absolute inset-0 bg-white/20" />
          <ListMinus className="relative z-10 h-3 w-3 text-white drop-shadow-lg sm:h-5 sm:w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-[10px] font-bold leading-tight text-foreground transition-colors duration-300 group-hover:text-blue-400 sm:text-sm">
            {playlist.title}
          </h3>
          <p className="text-[9px] font-medium text-muted-foreground sm:text-xs">
            {playlist.totalDuration}
          </p>
        </div>

        <Button
          size="icon"
          className="h-6 w-6 flex-none shrink-0 rounded-lg border-white/30 bg-white/20 backdrop-blur-md shadow-lg opacity-0 transition-all duration-300 hover:scale-110 hover:bg-white/30 group-hover:opacity-100 dark:border-white/20 dark:bg-white/10 dark:hover:bg-white/20 sm:h-8 sm:w-8"
        >
          <Play className="h-2.5 w-2.5 fill-current sm:h-3 sm:w-3" />
        </Button>
      </div>
    </div>
  );
}

export function RecentPlaylists() {
  const handlePlaylistClick = (playlistId: number) => {
    console.log(`Clicou na playlist ${playlistId}`);
  };

  return (
    // ✅ SEÇÃO ATUALIZADA COM FUNDO LIMPO E CONSISTENTE
    <section className="relative overflow-hidden py-12">
      <div className="container relative">
        <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/20 via-white/10 to-white/5 p-6 shadow-2xl shadow-black/10 backdrop-blur-2xl dark:border-white/10 dark:from-white/10 dark:via-white/5 dark:to-black/20 dark:shadow-black/30 md:p-10">
          <div className="relative z-10">
            <div className="mb-6 px-4 sm:px-0">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl border border-white/30 bg-white/20 p-2.5 dark:border-white/20 dark:bg-white/10">
                  <Podcast className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-xl font-bold text-transparent md:text-2xl">
                    Playlists Recentes
                  </h2>
                  <p className="text-xs font-medium text-muted-foreground">
                    Continue de onde parou
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {recentPlaylists.map((playlist) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  onClick={() => handlePlaylistClick(playlist.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
