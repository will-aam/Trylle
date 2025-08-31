"use client";

import { useState, useEffect } from "react";
import { Wrench, Construction, Code, Clock, Mail } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";

export default function DevelopmentPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de envio
    console.log({ email, message });
    setIsSubmitted(true);
    setEmail("");
    setMessage("");

    // Reset após 3 segundos
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                <Construction className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-white mb-4">
            Página em Desenvolvimento
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Estamos trabalhando duro para trazer algo incrível para você! Esta
            página estará disponível em breve.
          </p>

          <div className="flex items-center justify-center gap-4 text-gray-500 dark:text-gray-400 mb-8">
            <Clock className="w-5 h-5" />
            <span className="text-lg">Volte em breve!</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Code className="w-8 h-8 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  O que estamos criando?
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Uma experiência incrível com funcionalidades modernas, design
                responsivo e performance excepcional. Estamos finalizando os
                últimos detalhes para garantir a melhor qualidade.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-8 h-8 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Tempo estimado
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Estamos trabalhando para liberar o mais rápido possível. Se você
                gostaria de ser notificado quando estiver pronto, deixe seu
                contato abaixo!
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <Mail className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Quer ser avisado?
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Deixe seu email e te avisaremos quando estiver pronto!
              </p>
            </div>

            {isSubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full animate-pulse" />
                </div>
                <p className="text-green-600 dark:text-green-400 font-semibold">
                  Obrigado! Te avisaremos quando estiver pronto.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-4 max-w-md mx-auto"
              >
                <div>
                  <Input
                    type="email"
                    placeholder="Seu melhor email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Alguma sugestão ou mensagem? (opcional)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Me avise quando estiver pronto!
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} - Em desenvolvimento com ❤️
          </p>
        </div>
      </div>
    </div>
  );
}
