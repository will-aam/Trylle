import { create } from "zustand";
import { Episode } from "@/src/lib/types";

interface PlayerState {
  activeEpisode: Episode | null;
  isPlaying: boolean;
  setEpisode: (episode: Episode) => void;
  play: () => void;
  pause: () => void;
  reset: () => void; // Adicionamos a função de reset
}

export const usePlayer = create<PlayerState>((set) => ({
  activeEpisode: null,
  isPlaying: false,
  setEpisode: (episode) => set({ activeEpisode: episode, isPlaying: true }),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  reset: () => set({ activeEpisode: null, isPlaying: false }), // Ação para limpar o player
}));
