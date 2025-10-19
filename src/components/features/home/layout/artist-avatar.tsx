import Image from "next/image";

interface ArtistAvatarProps {
  name: string;
  image: string;
}

export function ArtistAvatar({ name, image }: ArtistAvatarProps) {
  return (
    <div className="flex flex-col items-center gap-2 cursor-pointer group">
      <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-emerald-500 transition-all">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
      <span className="text-xs text-gray-400 group-hover:text-white transition-colors">
        {name}
      </span>
    </div>
  );
}
