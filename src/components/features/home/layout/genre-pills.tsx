const genres = [
  { name: "Hip-Hop", color: "bg-cyan-600" },
  { name: "Love", color: "bg-red-600" },
  { name: "Festa", color: "bg-orange-600" },
  { name: "Treino", color: "bg-pink-600" },
  { name: "Kpop", color: "bg-purple-700" },
  { name: "Chill", color: "bg-indigo-800" },
  { name: "Rock", color: "bg-orange-700" },
]

export function GenrePills() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Gênero</h2>
        <button className="text-sm text-gray-400 hover:text-white transition-colors">Ver tudo</button>
      </div>

      <div className="flex flex-wrap gap-3">
        {genres.map((genre) => (
          <button
            key={genre.name}
            className={`${genre.color} px-6 py-3 rounded-full text-white font-medium hover:opacity-90 transition-opacity`}
          >
            {genre.name}
          </button>
        ))}
      </div>
    </section>
  )
}
