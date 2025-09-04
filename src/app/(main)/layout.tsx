import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/src/app/globals.css";
import { ThemeProvider } from "@/src/components/theme-provider";
import { Navbar } from "@/src/components/layout/navbar";
import { Sidebar } from "@/src/components/layout/sidebar";
import { AudioPlayer } from "@/src/components/features/audio-player";
import { AuthProvider } from "@/src/Providers/auth-provider";
import { Toaster } from "@/src/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Plataforma de Audiocasts",
  description: "Streaming de áudios educativos e informativos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="flex h-screen bg-background">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto pb-24">{children}</main>
              </div>
            </div>
            <AudioPlayer />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
