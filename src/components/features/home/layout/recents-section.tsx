import { RecentSongItem } from "./recents-play";

const recentSongs = [
  {
    title: "Kuning",
    artist: "Ruman Sakit",
    duration: "05:03",
    image: "/teste.jpg",
  },
  {
    title: "Heartless",
    artist: "Aditya Gadhvi",
    duration: "03:31",
    image: "/teste.jpg",
  },
  {
    title: "Calm Down",
    artist: "Rema, Selena G...",
    duration: "04:18",
    image: "/teste.jpg",
  },
];

export function RecentsSection() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Recentes</h2>
        <button className="text-sm text-gray-400 hover:text-white transition-colors">
          Ver tudo
        </button>
      </div>

      <div className="space-y-1">
        {recentSongs.map((song) => (
          <RecentSongItem key={song.title} {...song} />
        ))}
      </div>
    </section>
  );
}
