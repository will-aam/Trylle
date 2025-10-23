"use client";

import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-64 h-64 md:w-80 md:h-80 mb-8">
        {" "}
        <DotLottieReact
          src="https://lottie.host/b7c04c98-67b2-4717-ad04-ba8f6c9a673c/9X1HtLSoE2.lottie"
          loop
          autoplay
        />
      </div>

      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
        Em Construção
      </h1>
    </div>
  );
}
