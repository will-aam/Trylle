"use client"; // Converte para um Client Component

import "./globals.css";
import { ThemeProvider } from "@/src/components/theme-provider";
import { Toaster } from "@/src/components/ui/sonner";
import { AudioPlayer } from "@/src/components/features/audio-player";
import { usePlayer } from "@/src/hooks/use-player"; // Importa o hook
import { cn } from "@/src/lib/utils";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Verifica se há um episódio ativo para ajustar o layout
  const { activeEpisode } = usePlayer();

  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* O conteúdo principal agora tem um padding-bottom dinâmico */}
          <main className={cn("pb-20", !activeEpisode && "pb-0")}>
            {children}
          </main>
          <AudioPlayer />
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
