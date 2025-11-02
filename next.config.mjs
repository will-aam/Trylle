/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sua configuração de imagens
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      // permitir imagens (TEMPORARIO)
      {
        protocol: "https",
        hostname: "pub-ce0ce0293b9b45198e1f9086e196d8e9.r2.dev",
      },
      {
        protocol: "https",
        hostname: "img.freepik.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "static.vecteezy.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "st.depositphotos.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  // Função de redirecionamento aqui
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
