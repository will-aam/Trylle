"use client";

import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { AudioLines, Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useState } from "react";

export function NavbarLoggedOut() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-white dark:bg-black/30 dark:backdrop-blur-md px-4 sm:px-6">
        {/* Logo à esquerda com nome */}
        <Link href="/">
          <div className="flex items-center gap-2">
            <AudioLines className="h-6 w-6" />
            <span className="text-lg font-bold md:inline hidden">Trylle</span>
          </div>
        </Link>

        {/* Navegação Desktop */}
        <nav className="hidden md:flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/explore">Explorar</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/about">Sobre</Link>
          </Button>
        </nav>

        {/* Ações (Desktop) */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/signup">Cadastro</Link>
          </Button>
        </div>

        {/* Mobile: Botão de Cadastro ao lado do hambúrguer */}
        <div className="md:hidden flex items-center gap-2">
          <Button asChild>
            <Link href="/signup">Cadastre-se de graça</Link>
          </Button>
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Sidebar Mobile */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Overlay com fundo opaco */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setIsMenuOpen(false)}
        ></div>

        {/* Sidebar totalmente preto */}
        <div
          className={`absolute left-0 top-0 h-full w-64 bg-black shadow-lg transform transition-transform duration-300 ease-out ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Cabeçalho do sidebar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <Link
              href="/"
              className="flex items-center gap-3"
              onClick={() => setIsMenuOpen(false)}
            >
              <AudioLines className="h-6 w-6 text-white" />
              <span className="text-xl font-bold text-white">Trylle</span>
            </Link>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Navegação Mobile */}
          <nav className="flex flex-col p-4 space-y-2">
            <Button
              variant="ghost"
              asChild
              className="justify-start text-white hover:bg-gray-800 transition-colors duration-200"
            >
              <Link href="/" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              className="justify-start text-white hover:bg-gray-800 transition-colors duration-200"
            >
              <Link href="/explore" onClick={() => setIsMenuOpen(false)}>
                Explorar
              </Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              className="justify-start text-white hover:bg-gray-800 transition-colors duration-200"
            >
              <Link href="/about" onClick={() => setIsMenuOpen(false)}>
                Sobre
              </Link>
            </Button>
          </nav>

          {/* Divisor visual */}
          <div className="border-t border-gray-800 my-2 mx-4"></div>

          {/* Ações Mobile (apenas login) */}
          <div className="flex flex-col p-4 space-y-2">
            <Button
              asChild
              className="w-full bg-white hover:bg-gray-100 text-black transition-colors duration-200"
            >
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
