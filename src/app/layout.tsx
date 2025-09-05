import "./globals.css";
import { ThemeProvider } from "@/src/components/theme-provider";
import { Toaster } from "@/src/components/ui/sonner";
import { ClientLayoutWrapper } from "@/src/components/client-layout-wrapper"; // Importa o novo wrapper

// A exportação de metadados  só funciona em Componentes de Servidor
export const metadata = {
  title: "PlayCast | Sua plataforma de áudio",
  description: "Ouça seus podcasts e áudios favoritos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
