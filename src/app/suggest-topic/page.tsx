"use client";

import type React from "react";
import { ThemeToggle } from "@/src//components/layout/theme-toggle";

import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Badge } from "@/src/components/ui/badge";
import {
  ArrowLeft,
  Lightbulb,
  Users,
  TrendingUp,
  BookOpen,
  Briefcase,
  Heart,
  Globe,
  Zap,
  CheckCircle,
  Star,
  MessageSquare,
  X,
} from "lucide-react";
import Link from "next/link";

const categories = [
  { name: "Negócios", icon: Briefcase, color: "bg-blue-500" },
  { name: "Tecnologia", icon: Zap, color: "bg-purple-500" },
  { name: "Saúde", icon: Heart, color: "bg-red-500" },
  { name: "Educação", icon: BookOpen, color: "bg-green-500" },
  { name: "Cultura", icon: Globe, color: "bg-orange-500" },
  { name: "Desenvolvimento Pessoal", icon: TrendingUp, color: "bg-indigo-500" },
];

const popularSuggestions = [
  {
    title: "Inteligência Artificial no Trabalho",
    votes: 234,
    category: "Tecnologia",
  },
  {
    title: "Mindfulness e Produtividade",
    votes: 189,
    category: "Desenvolvimento Pessoal",
  },
  { title: "Sustentabilidade Empresarial", votes: 156, category: "Negócios" },
  { title: "História da Arte Moderna", votes: 143, category: "Cultura" },
  { title: "Nutrição Funcional", votes: 128, category: "Saúde" },
  { title: "Metodologias Ágeis", votes: 112, category: "Negócios" },
];

export default function SugerirTemaPage() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    email: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);

  useEffect(() => {
    setShowTipsModal(true);
  }, []);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setFormData((prev) => ({ ...prev, category }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
    setFormData({ title: "", description: "", category: "", email: "" });
    setSelectedCategory("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {showTipsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Dicas para uma boa sugestão
                  </h3>
                </div>
                <button
                  onClick={() => setShowTipsModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <p className="text-slate-600 text-xs sm:text-sm">
                  Para criar uma sugestão que realmente se destaque, siga estas
                  dicas:
                </p>

                <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-slate-700">
                  <li className="flex items-start gap-2 sm:gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 sm:mt-2 shrink-0"></div>
                    <span>
                      Seja específico sobre o que gostaria de aprender
                    </span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 sm:mt-2 shrink-0"></div>
                    <span>Explique por que o tema é relevante hoje</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 sm:mt-2 shrink-0"></div>
                    <span>
                      Mencione aspectos práticos que poderiam ser abordados
                    </span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 sm:mt-2 shrink-0"></div>
                    <span>
                      Considere como o tema pode ajudar outros ouvintes
                    </span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 sm:mt-2 shrink-0"></div>
                    <span>Use exemplos concretos quando possível</span>
                  </li>
                </ul>

                <div className="bg-green-50 rounded-lg p-3 sm:p-4 mt-3 sm:mt-4">
                  <p className="text-xs sm:text-sm text-green-800 font-medium">
                    💡 Lembre-se: quanto mais detalhada sua sugestão, maior a
                    chance de ser selecionada!
                  </p>
                </div>

                <Button
                  onClick={() => setShowTipsModal(false)}
                  className="w-full mt-4 sm:mt-6 bg-green-600 hover:bg-green-700 text-white h-10 sm:h-12 text-sm sm:text-base"
                >
                  Entendi, vamos começar!
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">Voltar</span>
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-5xl font-bold text-slate-900">
                Trylle
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
            Sua voz importa
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 sm:mb-6 text-balance px-2">
            Sugira um <span className="text-blue-600">Tema</span> para novos
            Episódios
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto text-pretty px-2">
            Ajude-nos a criar conteúdo que realmente importa para você. Sua
            sugestão pode se tornar o próximo episódio que transformará a vida
            de milhares de pessoas.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      Nova Sugestão
                    </h2>
                    <p className="text-sm sm:text-base text-slate-600">
                      Compartilhe sua ideia conosco
                    </p>
                  </div>
                </div>

                {isSubmitted && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">
                        Sugestão enviada com sucesso!
                      </p>
                      <p className="text-sm text-green-600">
                        Nossa equipe analisará sua proposta em breve.
                      </p>
                    </div>
                  </div>
                )}

                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 sm:space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 sm:mb-3">
                      Escolha uma categoria
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                      {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                          <button
                            key={category.name}
                            type="button"
                            onClick={() => handleCategorySelect(category.name)}
                            className={`p-3 sm:p-4 rounded-lg border-2 transition-all text-left ${
                              selectedCategory === category.name
                                ? "border-blue-500 bg-blue-50"
                                : "border-slate-200 hover:border-slate-300 bg-white"
                            }`}
                          >
                            <div
                              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg ${category.color} flex items-center justify-center mb-2`}
                            >
                              <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            </div>
                            <p className="font-medium text-slate-900 text-xs sm:text-sm">
                              {category.name}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-slate-700 mb-2"
                    >
                      Título do tema *
                    </label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Ex: Como a IA está transformando o mercado de trabalho"
                      required
                      className="h-10 sm:h-12 text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-slate-700 mb-2"
                    >
                      Descrição detalhada *
                    </label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Descreva por que este tema seria interessante, que aspectos deveriam ser abordados, e como pode ajudar os ouvintes..."
                      required
                      rows={4}
                      className="resize-none text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-slate-700 mb-2"
                    >
                      Seu e-mail (opcional)
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="seu@email.com"
                      className="h-10 sm:h-12 text-sm sm:text-base"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Para te notificarmos quando o episódio for lançado
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-10 sm:h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm sm:text-base"
                    disabled={
                      !formData.title ||
                      !formData.description ||
                      !selectedCategory
                    }
                  >
                    Enviar Sugestão
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                  <h3 className="font-bold text-base sm:text-lg">
                    Comunidade Ativa
                  </h3>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100 text-sm sm:text-base">
                      Sugestões recebidas
                    </span>
                    <span className="font-bold text-lg sm:text-xl">1,247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100 text-sm sm:text-base">
                      Episódios criados
                    </span>
                    <span className="font-bold text-lg sm:text-xl">89</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100 text-sm sm:text-base">
                      Taxa de aprovação
                    </span>
                    <span className="font-bold text-lg sm:text-xl">7.1%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Sugestões Populares
                  </h3>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {popularSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-2.5 sm:p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
                        <h4 className="font-medium text-slate-900 text-xs sm:text-sm leading-tight">
                          {suggestion.title}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
                          <TrendingUp className="w-3 h-3" />
                          {suggestion.votes}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {suggestion.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
