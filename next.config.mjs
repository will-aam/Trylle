/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sua configuração de imagens (continua aqui, intacta)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
  },

  // Adicionamos a função de redirecionamento aqui
  async redirects() {
    return [
      {
        source: "/login", // Se alguém tentar ir para /login...
        destination: "/auth", // ...mande-o para /auth
        permanent: true, // Avisa aos navegadores e ao Google que a mudança é definitiva
      },
      {
        source: "/signup", // Se alguém tentar ir para /signup...
        destination: "/auth", // ...mande-o para /auth também
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
