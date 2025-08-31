"use client";

import {
  Home,
  Compass,
  Heart,
  Clock,
  List,
  Settings,
  Headphones,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Separator } from "@/src/components/ui/separator";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";

const navigation = [
  { name: "Início", href: "/", icon: Home },
  { name: "Descobrir", href: "/discover", icon: Compass },
  { name: "Favoritos", href: "/favorites", icon: Heart },
  { name: "Histórico", href: "/history", icon: Clock },
  { name: "Playlists", href: "/playlists", icon: List },
];

const categories = [
  { name: "Tecnologia", href: "/category/tecnologia" },
  { name: "Educação", href: "/category/educacao" },
  { name: "Saúde", href: "/category/saude" },
  { name: "Negócios", href: "/category/negocios" },
  { name: "Ciência", href: "/category/ciencia" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-muted/30 border-r flex flex-col">
      <div className="p-6">
        <Link href="/" className="flex items-center space-x-2">
          <Headphones className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">Audiocasts</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1">
          {navigation.map((item) => (
            <Button
              key={item.name}
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                pathname === item.href && "bg-secondary"
              )}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            </Button>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-1">
          <h3 className="px-3 text-sm font-medium text-muted-foreground mb-2">
            Categorias
          </h3>
          {categories.map((category) => (
            <Button
              key={category.name}
              variant="ghost"
              className="w-full justify-start text-sm"
              asChild
            >
              <Link href={category.href}>{category.name}</Link>
            </Button>
          ))}
        </div>

        <Separator className="my-4" />

        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Link>
        </Button>
      </ScrollArea>
    </div>
  );
}
