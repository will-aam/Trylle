"use client";

import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { AudioLines, Menu, X, Lightbulb } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useState } from "react";

const navLinks = [
  { href: "#jornada", label: "Faça Parte" },
  { href: "/suggest-topic", label: "Sugerir Tema" },
  { href: "#faq", label: "FAQ" },
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
          {/* <Link href="/suggest-topic" legacyBehavior passHref>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sugerir um tema"
              className="rounded-full hover:bg-yellow-400/20"
            >
              <Lightbulb className="h-5 w-5 text-yellow-400" />
            </Button>
          </Link> */}
          <button
            className="p-2 rounded-lg hover:bg-accent md:hidden"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Sidebar Mobile - Fullscreen */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-transform duration-300 bg-background ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full w-full p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-lg text-foreground/80 hover:text-foreground"
                onClick={handleLinkClick}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
