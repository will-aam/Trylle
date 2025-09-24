import { Button } from "@/src/components/ui/button";
import { FileText, Headphones, ArrowRight } from "lucide-react";

export function UniqueFeatureSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/5 to-secondary/5">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance leading-tight">
              Ouça, Leia e Aprenda.{" "}
              <span className="text-primary">
                Cada episódio vem com resumo pesquisado e fontes claras.
              </span>
            </h2>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-sm sm:text-base">
                    Aprofunde seu conhecimento
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Cada PDF contém um resumo detalhado da pesquisa, permitindo
                    que você vá além do áudio.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-sm sm:text-base">
                    Consulte quando precisar
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Tenha acesso permanente às informações e fontes para
                    consultas futuras.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-sm sm:text-base">
                    Transparência total
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Veja exatamente quais fontes foram utilizadas e como
                    chegamos às conclusões.
                  </p>
                </div>
              </div>
            </div>

            <Button size="lg" className="gap-2 w-full sm:w-auto">
              Ver exemplo de episódio
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="relative order-1 lg:order-2">
            {/* Mock-up visual */}
            <div className="relative bg-white rounded-2xl shadow-2xl p-4 sm:p-6 max-w-xs sm:max-w-sm mx-auto">
              {/* Phone mockup */}
              <div className="bg-gray-900 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center">
                    <Headphones className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-xs sm:text-sm">
                      Inteligência Artificial
                    </h4>
                    <p className="text-gray-400 text-xs">
                      15 min • Episódio 23
                    </p>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg h-2 mb-2 sm:mb-3">
                  <div className="bg-primary h-2 rounded-lg w-1/3"></div>
                </div>
                <div className="flex items-center justify-center gap-3 sm:gap-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-700 rounded-full"></div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-l-3 sm:border-l-4 border-l-white border-y-2 border-y-transparent ml-1"></div>
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-700 rounded-full"></div>
                </div>
              </div>

              {/* PDF preview */}
              <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  <span className="text-xs font-medium">
                    Resumo de Pesquisa
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                  <div className="h-2 bg-gray-200 rounded w-4/5"></div>
                  <div className="h-2 bg-gray-200 rounded w-3/5"></div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-12 h-12 sm:w-16 sm:h-16 bg-secondary/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 w-16 h-16 sm:w-20 sm:h-20 bg-primary/20 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
