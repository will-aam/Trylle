import Link from "next/link";
import { Lightbulb } from "lucide-react";

import { Button } from "../ui/button";

export function InformationBar() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 via-background to-secondary/10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 lg:gap-12">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-white [text-shadow:1px_1px_2px_rgba(0,0,0,0.7)] flex-1">
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

        {/* <Link href="/suggest-topic" className="w-full sm:w-auto">
          <Button
            variant="outline"
            size="lg"
            className="text-base sm:text-lg px-6 py-4 sm:px-8 sm:py-6 gap-2 sm:gap-3 w-full sm:w-auto max-w-xs sm:max-w-none bg-transparent"
          >
            <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5" />
            Sugerir Tema
          </Button>
        </Link> */}
      </div>
    </section>
  );
}
