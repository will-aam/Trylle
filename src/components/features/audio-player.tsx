// src/components/features/audio-player.tsx
"use client";

import { useRef, useEffect, useState } from "react";
import { usePlayer } from "@/src/hooks/use-player";
import {
  Music2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Repeat,
  Repeat1,
  List, // 1. Ícone de lista importado
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Slider } from "@/src/components/ui/slider";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

const formatTime = (seconds: number) => {
  const flooredSeconds = Math.floor(seconds);
  const minutes = Math.floor(flooredSeconds / 60);
  const remainingSeconds = flooredSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const SKIP_AMOUNT = 15;

const AudioPlayer = () => {
  const { activeEpisode, isPlaying, play, pause } = usePlayer();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isLooping, setIsLooping] = useState(false);

  const isDisabled = !activeEpisode;

  useEffect(() => {
    if (activeEpisode && audioRef.current) {
      audioRef.current.src = activeEpisode.audio_url;
      audioRef.current.volume = volume;
      setCurrentTime(0);
      setDuration(0);
    }
  }, [activeEpisode, volume]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((e) => {
          console.error("Erro ao tentar reproduzir o áudio:", e);
          pause();
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, pause]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping]);

  const handlePlayPause = () => {
    if (isDisabled) return;
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnd = () => {
    if (!isLooping) {
      pause();
    }
  };

  const handleProgressChange = (value: number[]) => {
    if (audioRef.current) {
      const newTime = value[0];
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setVolume(newVolume);
  };

  const handleSkipForward = () => {
    if (audioRef.current) {
      const newTime = Math.min(
        audioRef.current.currentTime + SKIP_AMOUNT,
        duration
      );
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSkipBack = () => {
    if (audioRef.current) {
      const newTime = Math.max(audioRef.current.currentTime - SKIP_AMOUNT, 0);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleLooping = () => {
    setIsLooping((prev) => !prev);
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 h-20 border-t bg-background/95 backdrop-blur-sm">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnd}
      />

      {/* ============================================================
        LAYOUT DESKTOP
        ============================================================
      */}
      <div className="hidden h-full grid-cols-3 items-center px-4 md:grid md:px-6">
        {/* Seção Esquerda */}
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 rounded">
            <AvatarFallback className="rounded bg-muted">
              <Music2 className="h-6 w-6 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div className="block">
            <p
              className={`truncate text-sm font-medium ${
                isDisabled ? "text-muted-foreground/60" : "text-foreground"
              }`}
            >
              {activeEpisode?.title || "Nenhum episódio"}
            </p>
            <p
              className={`truncate text-xs ${
                isDisabled
                  ? "text-muted-foreground/40"
                  : "text-muted-foreground"
              }`}
            >
              {activeEpisode ? "Trylle" : "Selecione um play"}
            </p>
          </div>
        </div>

        {/* Seção Central */}
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              disabled={isDisabled}
              onClick={handleSkipBack}
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              variant="default"
              size="icon"
              className="h-10 w-10 rounded-full"
              disabled={isDisabled}
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 fill-white" />
              ) : (
                <Play className="h-5 w-5 fill-white" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              disabled={isDisabled}
              onClick={handleSkipForward}
            >
              <SkipForward className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLooping}
              disabled={isDisabled}
              data-active={isLooping}
              className={cn("rounded-full", "data-[active=true]:text-primary")}
            >
              {isLooping ? (
                <Repeat1 className="h-5 w-5" />
              ) : (
                <Repeat className="h-5 w-5" />
              )}
            </Button>
          </div>
          <div className="flex w-full max-w-sm items-center gap-2">
            <span
              className={`text-xs ${
                isDisabled
                  ? "text-muted-foreground/40"
                  : "text-muted-foreground"
              }`}
            >
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              className="w-full"
              disabled={isDisabled}
              onValueChange={handleProgressChange}
            />
            <span
              className={`text-xs ${
                isDisabled
                  ? "text-muted-foreground/40"
                  : "text-muted-foreground"
              }`}
            >
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Seção Direita */}
        <div className="flex items-center justify-end gap-2">
          {/* 2. Novo botão de lista adicionado */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            disabled={isDisabled}
          >
            <List className="h-5 w-5" />
          </Button>
          <Volume2 className="h-5 w-5 text-muted-foreground" />
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            className="w-24"
            disabled={isDisabled}
            onValueChange={handleVolumeChange}
          />
        </div>
      </div>

      {/* ============================================================
        LAYOUT MOBILE
        ============================================================
      */}
      <div className="flex h-full flex-col justify-center px-4 py-2 md:hidden">
        {/* Linha 1 */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-3 overflow-hidden">
            <Avatar className="h-10 w-10 rounded">
              <AvatarFallback className="rounded bg-muted">
                <Music2 className="h-5 w-5 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p
                className={`truncate text-sm font-medium ${
                  isDisabled ? "text-muted-foreground/60" : "text-foreground"
                }`}
              >
                {activeEpisode?.title || "Nenhum episódio"}
              </p>
              <p
                className={`truncate text-xs ${
                  isDisabled
                    ? "text-muted-foreground/40"
                    : "text-muted-foreground"
                }`}
              >
                {activeEpisode ? "Trylle" : "Selecione um play"}
              </p>
            </div>
          </div>
          <Button
            variant="default"
            size="icon"
            className="h-10 w-10 flex-shrink-0 rounded-full"
            disabled={isDisabled}
            onClick={handlePlayPause}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-white" />
            ) : (
              <Play className="h-5 w-5 fill-white" />
            )}
          </Button>
        </div>
        {/* Linha 2 */}
        <div className="flex w-full items-center gap-2 pt-1">
          <span
            className={`text-xs ${
              isDisabled ? "text-muted-foreground/40" : "text-muted-foreground"
            }`}
          >
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            className="w-full"
            disabled={isDisabled}
            onValueChange={handleProgressChange}
          />
          <span
            className={`text-xs ${
              isDisabled ? "text-muted-foreground/40" : "text-muted-foreground"
            }`}
          >
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default AudioPlayer;
