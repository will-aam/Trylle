"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayer } from "@/src/hooks/use-player";
import { Slider } from "@/src/components/ui/slider";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { formatTime } from "@/src/lib/utils"; // Vamos adicionar essa função em breve

export function AudioPlayer() {
  const { activeEpisode, isPlaying, play, pause } = usePlayer();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play();
    } else {
      audio.pause();
    }
  }, [isPlaying, activeEpisode]);

  // Efeitos para sincronizar o estado do áudio com o nosso componente
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateCurrentTime = () => setCurrentTime(audio.currentTime);
    const setAudioDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateCurrentTime);
    audio.addEventListener("loadedmetadata", setAudioDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateCurrentTime);
      audio.removeEventListener("loadedmetadata", setAudioDuration);
    };
  }, []);

  if (!activeEpisode) {
    return null; // Não mostra o player se nenhum áudio estiver ativo
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-background border-t z-50">
      <audio
        ref={audioRef}
        src={activeEpisode.audio_url}
        onEnded={pause}
        key={activeEpisode.id} // Força a recriação do elemento ao mudar de áudio
      />
      <div className="container mx-auto h-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="font-bold">{activeEpisode.title}</p>
            <p className="text-sm text-muted-foreground">
              {activeEpisode.categories?.name || "Sem categoria"}
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center gap-4 max-w-2xl">
          <span className="text-xs w-12 text-right">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            onValueChange={handleSeek}
            className="w-full"
          />
          <span className="text-xs w-12">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handlePlayPause}
            className="p-2 rounded-full bg-primary text-primary-foreground"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
