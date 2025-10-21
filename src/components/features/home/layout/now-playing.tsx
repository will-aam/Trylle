import {
  SkipBack,
  RotateCcw,
  Pause,
  RotateCw,
  SkipForward,
} from "lucide-react";
import Image from "next/image";
import { WaveformVisualizer } from "./waveform-visualizer";

export function NowPlaying() {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 shadow-2xl">
      {/* Album Art - Tamanho diminuído novamente */}
      <div className="relative w-56 h-56 mx-auto rounded-2xl overflow-hidden mb-6 shadow-xl">
        <Image
          src="/person-listening-music-red-background.jpg"
          alt="Echoes of Midnight"
          fill
          className="object-cover"
        />
      </div>

      {/* Song Info */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-1">
          Echoes of Midnight
        </h3>
        <p className="text-gray-200">Jon Hickman</p>
      </div>

      {/* Waveform */}
      <div className="mb-6">
        <WaveformVisualizer />
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-200 mb-2">
          <span>02:33</span>
          <span>04:18</span>
        </div>
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full"
            style={{ width: "60%" }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
          <SkipBack className="w-5 h-5 text-white fill-white" />
        </button>

        <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors relative">
          <RotateCcw className="w-4 h-4 text-white" />
          <span className="text-xs text-white absolute -bottom-5 left-1/2 -translate-x-1/2">
            15
          </span>
        </button>

        <button className="w-14 h-14 rounded-full bg-white hover:bg-gray-200 flex items-center justify-center transition-colors shadow-lg">
          <Pause className="w-6 h-6 text-blue-600 fill-blue-600" />
        </button>

        <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors relative">
          <RotateCw className="w-4 h-4 text-white" />
          <span className="text-xs text-white absolute -bottom-5 left-1/2 -translate-x-1/2">
            15
          </span>
        </button>

        <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
          <SkipForward className="w-5 h-5 text-white fill-white" />
        </button>
      </div>
    </div>
  );
}
