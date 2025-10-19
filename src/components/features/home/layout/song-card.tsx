import { Play } from "lucide-react"
import Image from "next/image"

interface SongCardProps {
  title: string
  artist: string
  image: string
  color: string
}

export function SongCard({ title, artist, image, color }: SongCardProps) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden group cursor-pointer aspect-square"
      style={{ backgroundColor: color }}
    >
      <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4">
        <h3 className="text-lg font-bold text-white mb-0.5">{title}</h3>
        <p className="text-sm text-gray-300">{artist}</p>
      </div>
      <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Play className="w-5 h-5 text-white fill-white" />
      </button>
    </div>
  )
}
