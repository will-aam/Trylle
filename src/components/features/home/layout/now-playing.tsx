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
    // EFEITO GLASS AQUI
    <div className="bg-gray-900/40 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl">
      {/* Album Art - IMAGEM ATUALIZADA */}
      <div className="relative w-56 h-56 mx-auto rounded-2xl overflow-hidden mb-6 shadow-xl">
        <Image
          src="https://img.freepik.com/vetores-gratis/ilustracoes-lo-fi-desenhadas-a-mao_23-2149325747.jpg"
          alt="Ilustração Lo-fi"
          fill
          className="object-cover"
        />
      </div>

      {/* Song Info */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">
          A Guerra das Certificações
        </h3>
        <p className="text-sm text-gray-300">Tecnologia</p>
      </div>

      {/* Waveform */}
      <div className="mb-6">
        <WaveformVisualizer />
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
          <span>02:33</span>
          <span>04:18</span>
        </div>
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-300"
            style={{ width: "60%" }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110">
          <SkipBack className="w-5 h-5 text-white fill-white" />
        </button>

        <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110 relative">
          <RotateCcw className="w-4 h-4 text-white" />
          <span className="text-xs text-white absolute -bottom-5 left-1/2 -translate-x-1/2">
            15
          </span>
        </button>

        <button className="w-14 h-14 rounded-full bg-white hover:bg-gray-200 flex items-center justify-center transition-all hover:scale-110 shadow-lg">
          <Pause className="w-6 h-6 text-blue-600 fill-blue-600" />
        </button>

        <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110 relative">
          <RotateCw className="w-4 h-4 text-white" />
          <span className="text-xs text-white absolute -bottom-5 left-1/2 -translate-x-1/2">
            15
          </span>
        </button>

        <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110">
          <SkipForward className="w-5 h-5 text-white fill-white" />
        </button>
      </div>
    </div>
  );
}
