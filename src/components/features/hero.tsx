import { Button } from "../ui/button";
import { Play } from "lucide-react";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative bg-gradient-to-r from-primary/10 to-secondary/10 py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              Descubra o mundo através do
              <span className="text-primary"> áudio</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Milhares de episódios educativos sobre tecnologia, ciência, saúde
              e muito mais. Aprenda enquanto caminha, trabalha ou relaxa.
            </p>
            <div className="flex space-x-4">
              <Button size="lg" className="text-lg px-8">
                <Play className="mr-2 h-5 w-5" />
                Começar a Ouvir
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8">
                Explorar Categorias
              </Button>
            </div>
          </div>
          <div className="relative">
            <Image
              src="/placeholder.svg?height=400&width=600"
              alt="Plataforma de Audiocasts"
              width={600}
              height={400}
              className="rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
