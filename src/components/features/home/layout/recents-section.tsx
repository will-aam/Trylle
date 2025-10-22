import { RecentSongItem } from "./cast-recent";

const recentSongs = [
  {
    title: "Kuning",
    artist: "Ruman Sakit",
    duration: "05:03",
    image:
      "https://img.freepik.com/vetores-premium/astronauta-bonito-dos-desenhos-animados-sentado-relaxar-ilustracao-vetorial_337879-84.jpg",
  },
  {
    title: "Heartless",
    artist: "Aditya Gadhvi",
    duration: "03:31",
    image:
      "https://img.freepik.com/vetores-premium/astronauta-bonito-dos-desenhos-animados-sentado-relaxar-ilustracao-vetorial_337879-84.jpg",
  },
  {
    title: "Calm Down",
    artist: "Rema, Selena G...",
    duration: "04:18",
    image:
      "https://img.freepik.com/vetores-premium/astronauta-bonito-dos-desenhos-animados-sentado-relaxar-ilustracao-vetorial_337879-84.jpg",
  },
  {
    title: "O Futuro da IA",
    artist: "Tech Talks",
    duration: "25:15",
    image:
      "https://img.freepik.com/vetores-premium/astronauta-bonito-dos-desenhos-animados-sentado-relaxar-ilustracao-vetorial_337879-84.jpg",
  },
  {
    title: "Histórias do Sertão",
    artist: "Causos Podcast",
    duration: "18:42",
    image:
      "https://img.freepik.com/vetores-premium/astronauta-bonito-dos-desenhos-animados-sentado-relaxar-ilustracao-vetorial_337879-84.jpg",
  },
  {
    title: "Meditação Guiada",
    artist: "Zen Space",
    duration: "12:00",
    image:
      "https://img.freepik.com/vetores-premium/astronauta-bonito-dos-desenhos-animados-sentado-relaxar-ilustracao-vetorial_337879-84.jpg",
  },
  {
    title: "Entrevista com CEO",
    artist: "Negócios & Sucesso",
    duration: "45:30",
    image:
      "https://img.freepik.com/vetores-premium/astronauta-bonito-dos-desenhos-animados-sentado-relaxar-ilustracao-vetorial_337879-84.jpg",
  },
  {
    title: "Resenha de Filmes",
    artist: "Cinefilia",
    duration: "30:55",
    image:
      "https://img.freepik.com/vetores-premium/astronauta-bonito-dos-desenhos-animados-sentado-relaxar-ilustracao-vetorial_337879-84.jpg",
  },
];

export function RecentsSection() {
  return (
    <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-bold text-white">Recentes</h2>
        <button className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors">
          Ver tudo
        </button>
      </div>

      {/* ALTURA MÁXIMA REDUZIDA AQUI */}
      <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
        {recentSongs.map((song) => (
          <RecentSongItem key={song.title} {...song} />
        ))}
      </div>
    </section>
  );
}
