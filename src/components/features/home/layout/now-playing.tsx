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
    <div className="bg-gradient-to-br from-lime-400 to-lime-500 rounded-3xl p-6 shadow-2xl">
      {/* Album Art */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-6 shadow-xl">
        <Image
          src="/person-listening-music-red-background.jpg"
          alt="Echoes of Midnight"
          fill
          className="object-cover"
        />
      </div>

      {/* Song Info */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-1">
          Echoes of Midnight
        </h3>
        <p className="text-gray-700">Jon Hickman</p>
      </div>

      {/* Waveform */}
      <div className="mb-6">
        <WaveformVisualizer />
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
          <span>02:33</span>
          <span>04:18</span>
        </div>
        <div className="h-1.5 bg-gray-900/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gray-900 rounded-full"
            style={{ width: "60%" }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button className="w-10 h-10 rounded-full bg-gray-900/10 hover:bg-gray-900/20 flex items-center justify-center transition-colors">
          <SkipBack className="w-5 h-5 text-gray-900 fill-gray-900" />
        </button>

        <button className="w-10 h-10 rounded-full bg-gray-900/10 hover:bg-gray-900/20 flex items-center justify-center transition-colors">
          <RotateCcw className="w-4 h-4 text-gray-900" />
          <span className="text-xs text-gray-900 absolute mt-8">15</span>
        </button>

        <button className="w-14 h-14 rounded-full bg-gray-900 hover:bg-gray-800 flex items-center justify-center transition-colors shadow-lg">
          <Pause className="w-6 h-6 text-lime-400 fill-lime-400" />
        </button>

        <button className="w-10 h-10 rounded-full bg-gray-900/10 hover:bg-gray-900/20 flex items-center justify-center transition-colors">
          <RotateCw className="w-4 h-4 text-gray-900" />
          <span className="text-xs text-gray-900 absolute mt-8">15</span>
        </button>

        <button className="w-10 h-10 rounded-full bg-gray-900/10 hover:bg-gray-900/20 flex items-center justify-center transition-colors">
          <SkipForward className="w-5 h-5 text-gray-900 fill-gray-900" />
        </button>
      </div>
    </div>
  );
}
