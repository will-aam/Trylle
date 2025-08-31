"use client";

import { useState } from "react";
import { Edit, Trash2, Eye, MoreHorizontal, Play } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

const mockEpisodes = [
  {
    id: "1",
    title: "O Futuro da Inteligência Artificial",
    category: "Tecnologia",
    duration: "39:00",
    plays: 15420,
    rating: 4.8,
    status: "published",
    publishedAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Neurociência e Aprendizado",
    category: "Ciência",
    duration: "31:30",
    plays: 12350,
    rating: 4.9,
    status: "published",
    publishedAt: "2024-01-12",
  },
  {
    id: "3",
    title: "Sustentabilidade Empresarial",
    category: "Negócios",
    duration: "35:00",
    plays: 9870,
    rating: 4.7,
    status: "draft",
    publishedAt: null,
  },
];

export function EpisodeManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [episodes] = useState(mockEpisodes);

  const filteredEpisodes = episodes.filter(
    (episode) =>
      episode.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      episode.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="default">Publicado</Badge>;
      case "draft":
        return <Badge variant="secondary">Rascunho</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Episódios</CardTitle>
        <div className="flex justify-between items-center">
          <Input
            placeholder="Buscar episódios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Plays</TableHead>
              <TableHead>Avaliação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEpisodes.map((episode) => (
              <TableRow key={episode.id}>
                <TableCell className="font-medium">{episode.title}</TableCell>
                <TableCell>{episode.category}</TableCell>
                <TableCell>{episode.duration}</TableCell>
                <TableCell>{episode.plays.toLocaleString()}</TableCell>
                <TableCell>⭐ {episode.rating}</TableCell>
                <TableCell>{getStatusBadge(episode.status)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* Opção Tocar Episódio com ícone */}
                      <DropdownMenuItem>
                        <Play className="mr-2 h-4 w-4" />
                        Tocar Episódio
                      </DropdownMenuItem>

                      {/* Opção Visualizar com ícone */}
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
                      </DropdownMenuItem>

                      {/* Opção Editar com ícone */}
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>

                      {/* Opção Excluir com ícone e cor vermelha */}
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
