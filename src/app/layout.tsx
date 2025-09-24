import type { Metadata } from "next";
import { Sora } from "next/font/google"; // Corrigido para usar a fonte Sora do seu projeto
import "./globals.css";
import { ThemeProvider } from "@/src/components/theme-provider";
import { Toaster as SonnerToaster } from "@/src/components/ui/sonner"; // Importação mais segura para evitar conflitos

const sora = Sora({ subsets: ["latin"] }); // Corrigido para usar a fonte Sora

export const metadata: Metadata = {
  title: "Trylle",
  description: "Ouça o futuro, hoje.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={sora.className}>
        {" "}
        {/* Corrigido para usar a fonte Sora */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <SonnerToaster richColors />{" "}
          {/* Usando a importação segura e ativando cores ricas */}
        </ThemeProvider>
      </body>
    </html>
  );
}
