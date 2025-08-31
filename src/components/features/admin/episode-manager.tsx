"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { MoreHorizontal, Play, Eye, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { createClient } from "@/src/lib/supabase-client";
import { Episode } from "@/src/lib/types";
import { usePlayer } from "@/src/hooks/use-player";

export function EpisodeManager() {
  const supabase = createClient();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const player = usePlayer();

  // Efeito para buscar os episódios do Supabase quando o componente é montado
  useEffect(() => {
    const fetchEpisodes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("episodes")
        .select(
          `
          *,
          categories ( name )
        `
        )
        .order("published_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar episódios:", error);
      } else {
        setEpisodes(data || []);
      }
      setLoading(false);
    };

    fetchEpisodes();
  }, [supabase]);

  if (loading) {
    return <p>Carregando episódios...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Episódios</CardTitle>
        <CardDescription>
          Visualize, edite e gerencie todos os seus episódios.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Publicado em</TableHead>
              <TableHead>
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {episodes.length > 0 ? (
              episodes.map((episode) => (
                <TableRow key={episode.id}>
                  <TableCell className="font-medium">{episode.title}</TableCell>
                  <TableCell>
                    {episode.categories ? (
                      <Badge variant="outline">{episode.categories.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(episode.published_at), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => player.setEpisode(episode)}
                        >
                          {" "}
                          {/* 3. Adicione o onClick */}
                          <Play className="mr-2 h-4 w-4" />
                          Tocar Episódio
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Nenhum episódio encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
