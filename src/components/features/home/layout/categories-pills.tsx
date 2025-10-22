const podcastCategories = [
  {
    name: "Comédia",
    textColor: "text-rose-400",
    glowColor: "shadow-rose-400/50",
  },
  {
    name: "Notícias",
    textColor: "text-sky-400",
    glowColor: "shadow-sky-400/50",
  },
  {
    name: "Tecnologia",
    textColor: "text-zinc-300",
    glowColor: "shadow-zinc-300/50",
  },
  {
    name: "História",
    textColor: "text-orange-400",
    glowColor: "shadow-orange-400/50",
  },
  {
    name: "Entrevistas",
    textColor: "text-teal-400",
    glowColor: "shadow-teal-400/50",
  },
  {
    name: "Negócios",
    textColor: "text-stone-300",
    glowColor: "shadow-stone-300/50",
  },
  {
    name: "Saúde",
    textColor: "text-green-400",
    glowColor: "shadow-green-400/50",
  },
  {
    name: "Educação",
    textColor: "text-violet-400",
    glowColor: "shadow-violet-400/50",
  },
];

export function CategoriesPills() {
  return (
    // 1. BORDA REMOVIDA e efeito de vidro intensificado
    <section className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 md:p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-bold text-white">Categorias</h2>
        <button className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors">
          Ver tudo
        </button>
      </div>

      <div className="flex flex-wrap gap-2 md:gap-3">
        {podcastCategories.map((category) => (
          <button
            key={category.name}
            className={`
              // 2. EFEITO DE VIDRO SEM BORDA
              bg-white/10
              backdrop-blur-2xl
              shadow-xl shadow-black/30

              // LAYOUT E TEXTO
              rounded-full
              px-4 md:px-6 py-2 md:py-3
              font-medium text-xs md:text-sm
              ${category.textColor}

              // TRANSIÇÕES E HOVER REFORÇADOS
              transition-all duration-300 ease-out
              hover:bg-white/25
              hover:shadow-2xl hover:shadow-black/40
              hover:${category.glowColor}
              active:scale-95
            `}
          >
            {category.name}
          </button>
        ))}
      </div>
    </section>
  );
}
