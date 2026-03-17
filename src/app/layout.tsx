// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/src/components/theme-provider";
import { Toaster as SonnerToaster } from "@/src/components/ui/sonner";

// ADICIONADO: Importando o nosso olheiro de atualizações
import { PwaUpdater } from "@/src/components/pwa-updater";

const sora = Sora({ subsets: ["latin"] });

// ADICIONADO: Configuração de viewport e cor da barra de status no celular
export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// MODIFICADO: Adicionado os links para o manifesto do PWA e o ícone da Apple
export const metadata: Metadata = {
  title: "Trylle",
  description: "Ouça o futuro, hoje!",
  manifest: "/site.webmanifest",
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className={sora.className}>
        <ThemeProvider
          attribute="class"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          {/* ADICIONADO: Componente invisível que fica escutando atualizações do PWA */}
          <PwaUpdater />

          {children}
          <SonnerToaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
