export function InformationBar() {
  // Criei um componente interno para evitar repetição de código
  const MarqueeContent = () => (
    <div className="flex-shrink-0 flex items-center gap-4 text-sm text-white [text-shadow:1px_1px_2px_rgba(0,0,0,0.7)] px-4">
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
  );

  return (
    <section className="py-6 bg-black/80 overflow-hidden">
      {/* Mobile: Marquee com loop infinito */}
      <div className="md:hidden flex whitespace-nowrap">
        <div className="animate-marquee">
          <MarqueeContent />
        </div>
        <div className="animate-marquee">
          <MarqueeContent />
        </div>
      </div>

      {/* Desktop: Estático e centralizado */}
      <div className="hidden md:flex justify-center">
        <div className="flex items-center gap-4 text-sm text-white [text-shadow:1px_1px_2px_rgba(0,0,0,0.7)]">
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
      </div>
    </section>
  );
}
