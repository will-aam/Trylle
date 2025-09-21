"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Episode } from "@/src/lib/types";

interface UpcomingEpisodesCarouselProps {
  episodes: Episode[];
}

export function UpcomingEpisodesCarousel({
  episodes: upcomingEpisodes,
}: UpcomingEpisodesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || upcomingEpisodes.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % upcomingEpisodes.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, upcomingEpisodes.length]);

  if (upcomingEpisodes.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? upcomingEpisodes.length - 1 : prev - 1
    );
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % upcomingEpisodes.length);
    setIsAutoPlaying(false);
  };

  const getVisibleEpisodes = () => {
    const episodes = [];
    for (let i = -2; i <= 3; i++) {
      const index =
        (currentIndex + i + upcomingEpisodes.length) % upcomingEpisodes.length;
      episodes.push({
        ...upcomingEpisodes[index],
        position: i,
      });
    }
    return episodes;
  };

  const formatPublishedAt = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.toLocaleDateString("en-US", { day: "2-digit" });
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const time = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return {
      date: `${day} ${month}`,
      time: time,
    };
  };

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Upcoming Episodes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Don't miss the next releases. Episodes carefully prepared with
            quality content.
          </p>
        </div>

        <div className="relative">
          {/* Desktop Carousel */}
          <div className="hidden md:block">
            <div className="flex items-center justify-center gap-4 overflow-hidden">
              {getVisibleEpisodes().map((episode, idx) => {
                const isCenter = episode.position === 0;
                const isVisible = Math.abs(episode.position) <= 2;
                const { date, time } = formatPublishedAt(episode.published_at);

                return (
                  <Card
                    key={`${episode.id}-${idx}`}
                    className={`
                      transition-all duration-700 ease-&lsqb;cubic-bezier(0.4,0,0.2,1)&rsqb; transform-gpu
                      ${
                        isCenter
                          ? "scale-110 z-10 shadow-xl border-primary/20"
                          : "scale-90 opacity-60"
                      }
                      ${isVisible ? "block" : "hidden"}
                      w-80 h-48 hover:shadow-lg
                    `}
                  >
                    <CardContent className="p-6 h-full flex flex-col justify-between">
                      <div>
                        <Badge variant="secondary" className="mb-3">
                          {episode.categories?.name || "No Category"}
                        </Badge>
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                          {episode.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {episode.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {time}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Mobile Carousel */}
          <div className="md:hidden">
            <div className="flex items-center justify-center">
              <Card className="w-full max-w-sm h-48 shadow-lg transition-all duration-500 ease-out">
                <CardContent className="p-6 h-full flex flex-col justify-between">
                  <div>
                    <Badge variant="secondary" className="mb-3">
                      {upcomingEpisodes[currentIndex].categories?.name ||
                        "No Category"}
                    </Badge>
                    <h3 className="font-semibold text-lg mb-2">
                      {upcomingEpisodes[currentIndex].title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {upcomingEpisodes[currentIndex].description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {
                        formatPublishedAt(
                          upcomingEpisodes[currentIndex].published_at
                        ).date
                      }
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {
                        formatPublishedAt(
                          upcomingEpisodes[currentIndex].published_at
                        ).time
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-transparent hover:bg-background/80 transition-all duration-300"
            onClick={goToPrevious}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-transparent hover:bg-background/80 transition-all duration-300"
            onClick={goToNext}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {upcomingEpisodes.map((_, idx) => (
              <button
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "bg-primary scale-125"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsAutoPlaying(false);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
