"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Library, Plus } from "lucide-react";
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
    label: "Biblioteca",
  },
  {
    icon: Plus,
    href: "/create-playlist",
    isSpecial: true,
  },
];

export function BottomNavbar() {
  const pathname = usePathname();

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-sm">
      <div className="grid h-16 grid-cols-4">
        {routes.map((route) => (
          <Link
            href={route.href}
            key={route.href}
            className={cn(
              "flex items-center justify-center transition-colors",
              pathname === route.href && "text-primary",
              route.isSpecial && "text-primary"
            )}
          >
            <div
              className={cn(
                "relative flex flex-col items-center justify-center gap-1",
                route.isSpecial && "p-1"
              )}
            >
              <route.icon
                className={cn("h-5 w-5", route.isSpecial && "h-6 w-6")}
              />
              {!route.isSpecial && (
                <span className="text-xs">{route.label}</span>
              )}
              {route.isSpecial && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
