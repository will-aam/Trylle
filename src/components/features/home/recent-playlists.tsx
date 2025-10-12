"use client";

import { Heart, Bookmark, History } from "lucide-react";
import { CustomRadioIcon } from "@/src/assets/icons/CustomRadioIcon";
import { cn } from "@/src/lib/utils";

// Tipagem para uma playlist
type Playlist = {
  id: number;
  title: string;
  totalDuration: string;
  color: string;
  coverImage?: string;
};

// Dados estáticos reordenados para o layout desejado
const recentPlaylists: Playlist[] = [
  {
    id: 4, // ID original mantido para consistência
    title: "Tecnologia & Inovação",
    totalDuration: "6h 20min",
    color: "bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600",
  },
  {
    id: 1, // ID original mantido
    title: "Podcasts curtidos",
    totalDuration: "12h 30min",
    color: "bg-rose-100 dark:bg-rose-950",
  },
  {
    id: 5, // ID original mantido
    title: "Filosofia Moderna",
    totalDuration: "4h 15min",
    color: "bg-gradient-to-br from-orange-500 via-red-500 to-pink-500",
  },
  {
    id: 2, // ID original mantido
    title: "Podcasts Salvos",
    totalDuration: "7h 10min",
    color: "bg-green-100 dark:bg-green-950",
  },
  {
    id: 6, // ID original mantido
    title: "Espiritualidade",
    totalDuration: "5h 45min",
    color: "bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-600",
  },
  {
    id: 3, // ID original mantido
    title: "Continue Ouvindo",
    totalDuration: "Resta 1h 20min",
    color: "bg-blue-100 dark:bg-blue-950",
  },
];

// CARD COM LÓGICA CONDICIONAL PARA OS 3 TIPOS
function PlaylistCard({
  playlist,
  onClick,
}: {
  playlist: Playlist;
  onClick: () => void;
}) {
  const isLikedPlaylist = playlist.title === "Podcasts curtidos";
  const isSavedPlaylist = playlist.title === "Podcasts Salvos";
  const isContinuePlaylist = playlist.title === "Continue Ouvindo";

  const getIcon = () => {
    const iconClasses = "relative z-10 h-6 w-6 drop-shadow-lg sm:h-8 sm:w-8";

    if (isLikedPlaylist) {
      return (
        <Heart
          className={cn(iconClasses, "text-rose-500")}
          fill="currentColor"
        />
      );
    }
    if (isSavedPlaylist) {
      return (
        <Bookmark
          className={cn(iconClasses, "text-green-500")}
          fill="currentColor"
        />
      );
    }
    if (isContinuePlaylist) {
      return <History className={cn(iconClasses, "text-blue-500")} />;
    }

    return <CustomRadioIcon className={cn(iconClasses, "text-white")} />;
  };

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-md bg-white/10 p-1 backdrop-blur-md transition-all duration-300 dark:bg-white/5 sm:p-2"
      onClick={onClick}
    >
      <div className="relative z-10 flex items-center gap-2">
        <div
          className={cn(
            "relative flex h-8 w-8 flex-none shrink-0 items-center justify-center overflow-hidden rounded-md shadow-lg transition-all duration-300 sm:h-12 sm:w-12",
            playlist.color
          )}
        >
          {getIcon()}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-[10px] font-bold leading-tight text-foreground transition-colors duration-300 sm:text-sm">
            {playlist.title}
          </h3>
          <p className="text-[9px] font-medium text-muted-foreground sm:text-xs">
            {playlist.totalDuration}
          </p>
        </div>
      </div>
    </div>
  );
}

export function RecentPlaylists() {
  const handlePlaylistClick = (playlistId: number) => {
    console.log(`Clicou na playlist ${playlistId}`);
  };

  return (
    <section>
      <div className="container">
        <div className="mb-2 px-1 sm:px-0">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-xl font-bold text-transparent md:text-2xl">
                Recentes
              </h2>
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
    </section>
  );
}
