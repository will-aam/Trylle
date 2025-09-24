"use client";

import {
  Clock,
  AlertTriangle,
  Brain,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";

export function ProblemSection() {
  const [currentCard, setCurrentCard] = useState(0);

  const problems = [
    {
      icon: Clock,
      title: "Tempo Perdido",
      description:
        "Podcasts de horas com pouco conteúdo útil. Você merece mais do que conversas vazias e distrações intermináveis.",
    },
    {
      icon: AlertTriangle,
      title: "Informação Duvidosa",
      description:
        "Conteúdo sem fontes claras ou baseado apenas em opiniões. Onde estão as referências e a credibilidade?",
    },
    {
      icon: Brain,
      title: "Aprendizado Passivo",
      description:
        "Você ouve, mas não consegue reter ou aprofundar. Como transformar o tempo investido em conhecimento real?",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentCard((prev) => (prev + 1) % problems.length);
    }, 9000);

    return () => clearInterval(timer);
  }, [problems.length]);

  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % problems.length);
  };

  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + problems.length) % problems.length);
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance mb-3 sm:mb-4 px-2 sm:px-0">
            Sua sede por conhecimento merece mais
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty px-2 sm:px-4 md:px-0">
            O problema não é a falta de conteúdo. É a falta de conteúdo que
            realmente vale seu tempo.
          </p>
        </div>

        <div className="sm:hidden">
          <div className="relative">
            <div className="flex items-center justify-center mb-4">
              <div className="flex space-x-2">
                {problems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentCard(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentCard
                        ? "bg-destructive"
                        : "bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="relative h-80 overflow-hidden">
              {problems.map((problem, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                    index === currentCard
                      ? "translate-x-0 opacity-100 scale-100"
                      : index < currentCard
                      ? "-translate-x-full opacity-0 scale-95"
                      : "translate-x-full opacity-0 scale-95"
                  }`}
                >
                  <div
                    className="h-full bg-gradient-to-br from-background to-muted/50 rounded-2xl border shadow-lg p-8 flex flex-col items-center justify-center text-center space-y-6 cursor-pointer hover:shadow-xl transition-shadow"
                    onClick={nextCard}
                  >
                    <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
                      <problem.icon className="w-10 h-10 text-destructive" />
                    </div>
                    <h3 className="text-xl font-semibold">{problem.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {problem.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="text-center space-y-3 sm:space-y-4 p-4 sm:p-0"
            >
              <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <problem.icon className="w-7 h-7 sm:w-8 sm:h-8 text-destructive" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold">
                {problem.title}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
