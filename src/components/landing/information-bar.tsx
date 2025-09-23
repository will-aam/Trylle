export function InformationBar() {
  return (
    <section className="py-6 px-4 sm:px-6 lg:px-8 via-background to-secondary/10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 lg:gap-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-white [text-shadow:1px_1px_2px_rgba(0,0,0,0.7)] flex-1">
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
