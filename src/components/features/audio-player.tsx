"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayer } from "@/src/hooks/use-player";
import { Slider } from "@/src/components/ui/slider";
import { Button } from "@/src/components/ui/button";
import { Play, Pause, Volume2, VolumeX, X } from "lucide-react";
import { formatTime } from "@/src/lib/utils";
import Image from "next/image";

export function AudioPlayer() {
  const { activeEpisode, isPlaying, play, pause, reset } = usePlayer();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch((e) => console.error("Erro ao tocar o áudio:", e));
    } else {
      audio.pause();
    }
  }, [isPlaying, activeEpisode]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current?.currentTime || 0);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current?.duration || 0);
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    } else if (newVolume === 0) {
      setIsMuted(true);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!activeEpisode) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-background/95 backdrop-blur-sm border-t z-50">
      <audio
        ref={audioRef}
        src={activeEpisode.audio_url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={pause}
        key={activeEpisode.id}
      />
      <div className="container mx-auto h-full flex items-center justify-between gap-4">
        {/* Informações do Episódio */}
        <div className="flex items-center gap-3 w-1/4">
          {/* <Image
            src="/"
            alt={activeEpisode.title}
            width={56}
            height={56}
            className="rounded-md h-14 w-14 object-cover"
          /> */}
          <div className="truncate">
            <p className="font-bold text-sm truncate">{activeEpisode.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {activeEpisode.categories?.name || "Sem categoria"}
            </p>
          </div>
        </div>

        {/* Controles Principais */}
        <div className="flex-1 flex items-center justify-center gap-2 max-w-2xl">
          <Button
            onClick={() => (isPlaying ? pause() : play())}
            size="icon"
            className="rounded-full h-10 w-10"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 fill-current" />
            )}
          </Button>
          <span className="text-xs w-12 text-right text-muted-foreground">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={duration || 1}
            step={1}
            onValueChange={handleSeek}
            className="w-full"
          />
          <span className="text-xs w-12 text-muted-foreground">
            {formatTime(duration)}
          </span>
        </div>

        {/* Controles de Volume e Fechar */}
        <div className="flex items-center gap-3 w-1/4 justify-end">
          <div className="flex items-center gap-2 w-32">
            <Button onClick={toggleMute} variant="ghost" size="icon">
              {isMuted || volume === 0 ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
            />
          </div>
          <Button onClick={reset} variant="ghost" size="icon">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
