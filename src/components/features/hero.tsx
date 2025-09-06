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

      {/* Main content, above the overlay */}
      <div className="relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight [text-shadow:1px_1px_3px_var(--tw-shadow-color)] shadow-black/60 text-white">
                {" "}
                Descubra o mundo através do
                <span className="text-primary"> áudio</span>
              </h1>
              <p className="text-xl text-neutral-200">
                Milhares de episódios educativos sobre tecnologia, ciência,
                saúde e muito mais. Aprenda enquanto caminha, trabalha ou
                relaxa.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/login">
                  <Button size="lg" className="text-lg px-8">
                    <Play className="mr-2 h-5 w-5" />
                    Começar a Ouvir
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="text-lg px-8">
                  Explorar Categorias
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
