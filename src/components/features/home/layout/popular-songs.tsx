import { SongCard } from "./song-card";
import { CategoryFilters } from "./category-filters";

const songs = [
  {
    title: "Golden Days",
    artist: "Felix Carter",
    image: "/person-listening-music-red-background.jpg",
    color: "#dc2626",
  },
  {
    title: "Fading Horizon",
    artist: "Ella Hart",
    image: "/person-with-headphones-teal-background.jpg",
    color: "#0891b2",
  },
  {
    title: "Waves of Time",
    artist: "Lana Rivers",
    image: "/person-music-blue-background.jpg",
    color: "#2563eb",
  },
  {
    title: "Electric Dreams",
    artist: "Mia Jones",
    image: "/person-yellow-background-music.jpg",
    color: "#d97706",
  },
];

export function PopularSongs() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Podcasts Populares</h2>
      </div>

      <CategoryFilters />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {songs.map((song) => (
          <SongCard key={song.title} {...song} />
        ))}
      </div>
    </section>
  );
}
