"use client"

import { Play, Clock, Star, MoreHorizontal } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import Image from 'next/image'
import Link from 'next/link'

interface Episode {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: number
  category: string
  author: string
  publishedAt: string
  plays: number
  rating: number
}

interface EpisodeCardProps {
  episode: Episode
}

export function EpisodeCard({ episode }: EpisodeCardProps) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatPlays = (plays: number) => {
    if (plays >= 1000000) {
      return `${(plays / 1000000).toFixed(1)}M`
    } else if (plays >= 1000) {
      return `${(plays / 1000).toFixed(1)}K`
    }
    return plays.toString()
  }

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-0">
        <div className="relative">
          <Image
            src={episode.thumbnail || "/placeholder.svg"}
            alt={episode.title}
            width={300}
            height={200}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-t-lg flex items-center justify-center">
            <Button size="icon" className="rounded-full">
              <Play className="h-6 w-6" />
            </Button>
          </div>
          <Badge className="absolute top-2 left-2" variant="secondary">
            {episode.category}
          </Badge>
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            <Clock className="inline h-3 w-3 mr-1" />
            {formatDuration(episode.duration)}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <Link href={`/episode/${episode.id}`} className="flex-1">
              <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
                {episode.title}
              </h3>
            </Link>
            <Button variant="ghost" size="icon" className="ml-2">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {episode.description}
          </p>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{episode.author}</span>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                <span>{episode.rating}</span>
              </div>
              <span>•</span>
              <span>{formatPlays(episode.plays)} plays</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
