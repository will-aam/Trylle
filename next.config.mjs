import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  // CORREÇÃO 1: Alterado conforme o aviso do Serwist pede
  disable: process.env.NODE_ENV !== "production",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // CORREÇÃO 2: Avisa ao Next.js 16 que sabemos sobre o Turbopack e silencia o erro
  turbopack: {},

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
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

  async redirects() {
    return [
      {
        source: "/login",
        destination: "/auth",
        permanent: true,
      },
      {
        source: "/signup",
        destination: "/auth",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);
