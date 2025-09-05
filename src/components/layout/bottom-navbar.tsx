"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Library } from "lucide-react";
import { cn } from "@/src/lib/utils";

const routes = [
  {
    icon: Home,
    href: "/",
    label: "Início",
  },
  {
    icon: Search,
    href: "/search",
    label: "Buscar",
  },
  {
    icon: Library,
    href: "/library",
    label: "Sua Biblioteca",
  },
];

export function BottomNavbar() {
  const pathname = usePathname();

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-sm">
      <div className="grid h-16 grid-cols-3">
        {routes.map((route) => (
          <Link
            href={route.href}
            key={route.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary",
              pathname === route.href && "text-primary"
            )}
          >
            <route.icon className="h-5 w-5" />
            <span className="text-xs">{route.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
