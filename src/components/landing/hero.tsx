import Link from "next/link";
import { Button } from "../ui/button";
import { Play } from "lucide-react";

export function Hero() {
  return (
    <section
      className="relative bg-cover bg-center bg-no-repeat -mt-14 pt-28 pb-20 -mx-4 sm:-mx-6 md:-mx-8"
      style={{ backgroundImage: "url('/hero-background.jpg')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* Conteúdo principal, acima do overlay */}
      <div className="relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight [text-shadow:1px_1px_3px_var(--tw-shadow-color)] shadow-black/60 text-white">
                {" "}
                Descubra o mundo através do
                <span className="text-primary"> áudio</span>
              </h1>
              {/* CORREÇÃO AQUI */}
              <p className="text-white text-lg [text-shadow:1px_1px_2px_rgba(0,0,0,0.7)]">
                Milhares de episódios educativos sobre tecnologia, ciência,
                saúde e muito mais. Aprenda enquanto caminha, trabalha ou
                relaxa.
              </p>
              <div className="flex items-center gap-4">
                <Button size="lg" asChild>
                  <Link href="/signup">
                    {" "}
                    <Play />
                    Começar a Aprender
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* CORREÇÃO AQUI */}
      <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-white [text-shadow:1px_1px_2px_rgba(0,0,0,0.7)]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          Acesso 100% gratuito
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          Sem anúncios
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full" />
          Baseado em pesquisa
        </div>
      </div>
    </section>
  );
}
