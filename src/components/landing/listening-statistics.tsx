"use client";

import { useState, useEffect, useRef } from "react";
import {
  Play,
  Clock,
  BookOpen,
  TrendingUp,
  Calendar,
  Award,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";

export function ListeningStatistics() {
  const [activeTab, setActiveTab] = useState<"overview" | "details">(
    "overview"
  );
  const [animatedMinutes, setAnimatedMinutes] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const stats = {
    totalMinutes: 847,
    episodesCompleted: 23,
    currentStreak: 7,
    averageDaily: 45,
    favoriteCategory: "Desenvolvimento Pessoal",
    monthlyProgress: [
      { day: 1, minutes: 30 },
      { day: 8, minutes: 65 },
      { day: 15, minutes: 45 },
      { day: 22, minutes: 80 },
      { day: 29, minutes: 55 },
    ],
    timeDistribution: [
      { period: "Manhã", minutes: 320, percentage: 38 },
      { period: "Tarde", minutes: 285, percentage: 34 },
      { period: "Noite", minutes: 242, percentage: 28 },
    ],
  };

  useEffect(() => {
    const currentRef = sectionRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          observer.unobserve(currentRef);
          const duration = 2000;
          const steps = 60;
          const increment = stats.totalMinutes / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= stats.totalMinutes) {
              setAnimatedMinutes(stats.totalMinutes);
              clearInterval(timer);
            } else {
              setAnimatedMinutes(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(currentRef);
    return () => observer.disconnect();
  }, [stats.totalMinutes]);

  return (
    <section
      ref={sectionRef}
      className="py-16 lg:py-24 bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-none dark:bg-black"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Suas Estatísticas de Aprendizado
          </h2>
          <p className="text-lg text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
            Acompanhe seu progresso e veja como o Trylle está transformando sua
            rotina de aprendizado
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="bg-white dark:bg-slate-900 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-slate-800">
              <Button
                variant={activeTab === "overview" ? "default" : "ghost"}
                onClick={() => setActiveTab("overview")}
                className="px-6 py-2"
              >
                Visão Geral
              </Button>
              <Button
                variant={activeTab === "details" ? "default" : "ghost"}
                onClick={() => setActiveTab("details")}
                className="px-6 py-2"
              >
                Detalhes
              </Button>
            </div>
          </div>

          {activeTab === "overview" ? (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Tempo Total</h3>
                    <p className="text-blue-100">Este mês</p>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="text-4xl font-bold mb-2">
                    {animatedMinutes}{" "}
                    <span className="text-2xl font-normal">minutos</span>
                  </div>
                  <p className="text-blue-100">
                    Média diária: {stats.averageDaily} min
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="w-4 h-4" />
                      <span className="text-sm">Episódios</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {stats.episodesCompleted}
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="w-4 h-4" />
                      <span className="text-sm">Sequência</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {stats.currentStreak} dias
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-lg dark:shadow-none border border-gray-200 dark:border-slate-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Categoria Favorita
                      </h4>
                      <p className="text-gray-500 dark:text-slate-400 text-sm">
                        Mais ouvida
                      </p>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {stats.favoriteCategory}
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-3/4"></div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-lg dark:shadow-none border border-gray-200 dark:border-slate-800">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Você aprende mais pela manhã
                  </h4>
                  <div className="space-y-3">
                    {stats.timeDistribution.map((period, index) => (
                      <div
                        key={period.period}
                        className="flex items-center gap-3"
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${
                            index === 0
                              ? "bg-green-500"
                              : index === 1
                              ? "bg-blue-500"
                              : "bg-purple-500"
                          }`}
                        ></div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-600 dark:text-slate-300">
                              {period.period}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-slate-400">
                              {period.minutes}min
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                index === 0
                                  ? "bg-green-500"
                                  : index === 1
                                  ? "bg-blue-500"
                                  : "bg-purple-500"
                              }`}
                              style={{ width: `${period.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg dark:shadow-none border border-gray-200 dark:border-slate-800">
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Progresso Mensal
                </h4>
                <div className="flex items-end justify-between h-48 gap-4">
                  {stats.monthlyProgress.map((day) => (
                    <div
                      key={day.day}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg mb-2 min-h-[20px]"
                        style={{
                          height: `${
                            (day.minutes /
                              Math.max(
                                ...stats.monthlyProgress.map((d) => d.minutes)
                              )) *
                            100
                          }%`,
                        }}
                      ></div>
                      <span className="text-xs text-gray-500 dark:text-slate-400">
                        {day.day}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-slate-500 mt-2">
                  <span>0</span>
                  <span>80 min</span>
                </div>
              </div>

              <div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Conquistas Recentes
                </h4>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/50 dark:to-yellow-800/50 border border-yellow-300 dark:border-yellow-700/50 rounded-lg p-4">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mb-3">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Primeira Semana
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      7 dias consecutivos
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 border border-green-300 dark:border-green-700/50 rounded-lg p-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-3">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Explorador
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      20+ episódios ouvidos
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 border border-blue-300 dark:border-blue-700/50 rounded-lg p-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mb-3">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Maratonista
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      10+ horas este mês
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
