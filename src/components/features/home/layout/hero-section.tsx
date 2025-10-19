import { Play } from "lucide-react"
import Image from "next/image"

export function HeroSection() {
  return (
    <div className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer">
      <Image src="/person-listening-music-red-background.jpg" alt="Echoes of Midnight" fill className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute bottom-6 left-6 right-6">
        <h2 className="text-3xl font-bold text-white mb-1">Echoes of Midnight</h2>
        <p className="text-gray-300">Jon Hickman</p>
      </div>
      <button className="absolute top-6 right-6 w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Play className="w-6 h-6 text-white fill-white" />
      </button>
    </div>
  )
}
