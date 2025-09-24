"use client";

import {
  Zap,
  Shield,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";

export function SolutionSection() {
  const [currentCard, setCurrentCard] = useState(0);

  const solutions = [
    {
      icon: Zap,
      title: "Conteúdo Condensado",
      description:
        "Episódios de 10-30 minutos, diretos ao ponto. Cada minuto é valioso e focado no que realmente importa.",
    },
    {
      icon: Shield,
      title: "Credibilidade em Primeiro Lugar",
      description:
        "Pesquisa rigorosa com múltiplas fontes. Transparência total sobre de onde vem cada informação.",
    },
    {
      icon: GraduationCap,
      title: "De Ouvinte a Estudante",
      description:
        "Cada episódio vem com material de apoio em PDF. Transforme o tempo de escuta em aprendizado ativo.",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentCard((prev) => (prev + 1) % solutions.length);
    }, 9000);

    return () => clearInterval(timer);
  }, [solutions.length]);

  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % solutions.length);
  };

  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + solutions.length) % solutions.length);
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance mb-3 sm:mb-4 px-2 sm:px-0">
            <span className="text-primary">Trylle</span>: A revolução do
            áudio-learning
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty px-2 sm:px-4 md:px-0">
            Não é apenas mais um podcast. É uma nova forma de aprender,
            otimizada para sua vida corrida.
          </p>
        </div>

        <div className="sm:hidden">
          <div className="relative">
            <div className="flex items-center justify-center mb-4">
              <div className="flex space-x-2">
                {solutions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentCard(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentCard
                        ? "bg-primary"
                        : "bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="relative h-80 overflow-hidden">
              {solutions.map((solution, index) => (
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
                    className="h-full bg-gradient-to-br from-background to-primary/5 rounded-2xl border shadow-lg p-8 flex flex-col items-center justify-center text-center space-y-6 cursor-pointer hover:shadow-xl transition-shadow"
                    onClick={nextCard}
                  >
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                      <solution.icon className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{solution.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {solution.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className="text-center space-y-3 sm:space-y-4 p-4 sm:p-0"
            >
              <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <solution.icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold">
                {solution.title}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {solution.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
