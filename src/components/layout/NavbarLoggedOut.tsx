"use client";

import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { AudioLines, Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useState } from "react";

const navLinks = [
  { href: "#problema", label: "O Problema" },
  { href: "#solucao", label: "A Solução" },
  { href: "#diferencial", label: "Diferencial" },
  { href: "#jornada", label: "Faça Parte" },
  { href: "#faq", label: "FAQ" },
  { href: "/suggest-topic", label: "Sugerir Tema" },
];

export function NavbarLoggedOut() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-md px-4 sm:px-6">
        {/* Logo à esquerda */}
        <Link href="/" className="flex items-center gap-2">
          <AudioLines className="h-6 w-6" />
          <span className="text-lg font-bold">Trylle</span>
        </Link>

        {/* Navegação Desktop */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Button variant="ghost" asChild key={link.href}>
              <a href={link.href}>{link.label}</a>
            </Button>
          ))}
        </nav>

        {/* Ações e Menu Mobile */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            className="p-2 rounded-lg hover:bg-accent md:hidden"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Sidebar Mobile */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-background/60"
          onClick={handleLinkClick}
        ></div>

        {/* Conteúdo do Sidebar */}
        <div className="absolute right-0 top-0 h-full w-64 bg-background shadow-lg">
          <div className="flex items-center justify-between p-4 border-b">
            <Link
              href="/"
              className="flex items-center gap-3"
              onClick={handleLinkClick}
            >
              <AudioLines className="h-6 w-6" />
              <span className="text-xl font-bold">Trylle</span>
            </Link>
            <button
              onClick={handleLinkClick}
              className="p-2 rounded-lg hover:bg-accent"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col p-4 space-y-2">
            {navLinks.map((link) => (
              <Button
                variant="ghost"
                asChild
                key={link.href}
                className="justify-start"
              >
                <a href={link.href} onClick={handleLinkClick}>
                  {link.label}
                </a>
              </Button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
