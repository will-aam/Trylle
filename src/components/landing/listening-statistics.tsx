"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { TrendingUp, Users, Clock, Headphones, BarChart3, Activity } from "lucide-react"

interface StatCard {
  id: number
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  trend: string
  color: string
}

const statisticsData: StatCard[] = [
  {
    id: 1,
    title: "Tempo Total de Escuta",
    value: "2.4M",
    subtitle: "horas reproduzidas",
    icon: <Clock className="w-8 h-8" />,
    trend: "+23% este mês",
    color: "text-blue-500",
  },
  {
    id: 2,
    title: "Usuários Ativos",
    value: "150K",
    subtitle: "ouvintes mensais",
    icon: <Users className="w-8 h-8" />,
    trend: "+18% este mês",
    color: "text-green-500",
  },
  {
    id: 3,
    title: "Episódios Favoritos",
    value: "89K",
    subtitle: "episódios salvos",
    icon: <Headphones className="w-8 h-8" />,
    trend: "+31% este mês",
    color: "text-purple-500",
  },
  {
    id: 4,
    title: "Engajamento",
    value: "94%",
    subtitle: "taxa de conclusão",
    icon: <TrendingUp className="w-8 h-8" />,
    trend: "+5% este mês",
    color: "text-orange-500",
  },
  {
    id: 5,
    title: "Categorias Populares",
    value: "12",
    subtitle: "temas em alta",
    icon: <BarChart3 className="w-8 h-8" />,
    trend: "Tecnologia lidera",
    color: "text-cyan-500",
  },
]

export function ListeningStatistics() {
  const [currentIndex, setCurrentIndex] = useState(2) // Start with center card
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % statisticsData.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const getVisibleCards = () => {
    const cards = []
    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + statisticsData.length) % statisticsData.length
      cards.push({
        ...statisticsData[index],
        position: i,
      })
    }
    return cards
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Estatísticas de Escuta</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Acompanhe o crescimento da nossa comunidade e veja como estamos impactando a vida dos nossos ouvintes.
          </p>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block">
          <div className="flex items-center justify-center gap-4 overflow-hidden">
            {getVisibleCards().map((card, idx) => {
              const isCenter = card.position === 0
              const isVisible = Math.abs(card.position) <= 2

              return (
                <Card
                  key={`${card.id}-${idx}`}
                  className={`
                    transition-all duration-800 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] cursor-pointer transform-gpu
                    ${
                      isCenter
                        ? "scale-110 z-10 shadow-2xl border-primary/30 bg-gradient-to-br from-card to-primary/5"
                        : "scale-90 opacity-60 hover:opacity-80 hover:scale-95"
                    }
                    ${isVisible ? "block" : "hidden"}
                    w-80 h-56
                  `}
                  onClick={() => {
                    setCurrentIndex((currentIndex - card.position + statisticsData.length) % statisticsData.length)
                    setIsAutoPlaying(false)
                  }}
                >
                  <CardContent className="p-6 h-full flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className={`${card.color} opacity-80 transition-all duration-300`}>{card.icon}</div>
                        <Badge variant="secondary" className="text-xs">
                          {card.trend}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg leading-tight">{card.title}</h3>
                        <div className="space-y-1">
                          <div className="text-3xl font-bold text-primary">{card.value}</div>
                          <p className="text-sm text-muted-foreground">{card.subtitle}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Activity className="w-3 h-3" />
                      <span>Atualizado em tempo real</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden">
          <div className="flex justify-center">
            <Card className="w-full max-w-sm h-56 shadow-xl bg-gradient-to-br from-card to-primary/5 transition-all duration-500 ease-out">
              <CardContent className="p-6 h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`${statisticsData[currentIndex].color} opacity-80`}>
                      {statisticsData[currentIndex].icon}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {statisticsData[currentIndex].trend}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg leading-tight">{statisticsData[currentIndex].title}</h3>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-primary">{statisticsData[currentIndex].value}</div>
                      <p className="text-sm text-muted-foreground">{statisticsData[currentIndex].subtitle}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Activity className="w-3 h-3" />
                  <span>Atualizado em tempo real</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {statisticsData.map((_, idx) => (
            <button
              key={idx}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? "bg-primary scale-125" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              onClick={() => {
                setCurrentIndex(idx)
                setIsAutoPlaying(false)
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
