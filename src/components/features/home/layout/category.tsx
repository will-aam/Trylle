import { ArtistAvatar } from "./artist-avatar";

const artists = [
  { name: "Negócios", image: "/teste.jpg" },
  { name: "Saúde", image: "/teste.jpg" },
  { name: "Tecnologia", image: "/teste.jpg" },
  { name: "Teologia", image: "/teste.jpg" },
  { name: "Filosofia", image: "/teste.jpg" },
];

export function TopArtists() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Categorias</h2>
        <button className="text-sm text-gray-400 hover:text-white transition-colors">
          Ver tudo
        </button>
      </div>

      <div className="flex items-center gap-4">
        {artists.map((artist) => (
          <ArtistAvatar key={artist.name} {...artist} />
        ))}
      </div>
    </section>
  );
}
