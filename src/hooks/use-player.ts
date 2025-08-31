import { create } from "zustand";
import { Episode } from "@/src/lib/types";

interface PlayerState {
  activeEpisode: Episode | null;
  isPlaying: boolean;
  setEpisode: (episode: Episode) => void;
  play: () => void;
  pause: () => void;
}

export const usePlayer = create<PlayerState>((set) => ({
  activeEpisode: null,
  isPlaying: false,
  setEpisode: (episode) => set({ activeEpisode: episode, isPlaying: true }),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
}));

// Nota: Estamos usando uma pequena e poderosa biblioteca de gerenciamento de estado chamada zustand. Ela já foi incluída no package.json do projeto de referência, então deve funcionar sem instalação adicional. Se der erro, rodamos pnpm install zustand
