import { Play, MoreVertical } from "lucide-react";
import Image from "next/image";

interface RecentSongItemProps {
  title: string;
  artist: string;
  duration: string;
  image: string;
}

export function RecentSongItem({
  title,
  artist,
  duration,
  image,
}: RecentSongItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group">
      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-5 h-5 text-white fill-white" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-white truncate">{title}</h4>
        <p className="text-xs text-gray-400 truncate">{artist}</p>
      </div>

      <span className="text-xs text-gray-400">{duration}</span>

      <button className="opacity-0 group-hover:opacity-100 transition-opacity">
        <MoreVertical className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );
}
