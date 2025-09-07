"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  MoreHorizontal,
  Play,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { createClient } from "@/src/lib/supabase-client";
import { Episode, Category } from "@/src/lib/types";
import { usePlayer } from "@/src/hooks/use-player";
import { useToast } from "@/src/hooks/use-toast";
import { EditEpisodeDialog } from "./edit-episode-dialog";

export function EpisodeManager() {
  const supabase = createClient();
  const player = usePlayer();
  const { toast } = useToast();

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

  // Filter and sort states
  const [categories, setCategories] = useState<Category[]>([]);
  const [isTitleSearchActive, setIsTitleSearchActive] = useState(false);
  const [titleSearchTerm, setTitleSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [sortOrder, setSortOrder] = useState({ ascending: false });

  const fetchEpisodes = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("episodes").select(`*, categories ( name )`);

    if (titleSearchTerm) {
      query = query.ilike("title", `%${titleSearchTerm}%`);
    }

    if (selectedCategoryId) {
      query = query.eq("category_id", selectedCategoryId);
    }

    query = query.order("published_at", {
      ascending: sortOrder.ascending,
    });

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao buscar episódios:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os episódios.",
        variant: "destructive",
      });
    } else {
      setEpisodes(data || []);
    }
    setLoading(false);
  }, [supabase, toast, titleSearchTerm, selectedCategoryId, sortOrder]);

  useEffect(() => {
    fetchEpisodes();
  }, [fetchEpisodes]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) {
        toast({
          title: "Erro ao buscar categorias",
          description:
            "Não foi possível carregar a lista de categorias para o filtro.",
          variant: "destructive",
        });
      } else {
        setCategories(data || []);
      }
    };

    fetchCategories();
  }, [supabase, toast]);

  const handleEdit = (episode: Episode) => {
    setSelectedEpisode(episode);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (episodeToDelete: Episode) => {
    try {
      const fileKey = new URL(episodeToDelete.audio_url).pathname.substring(1);

      const response = await fetch("/api/delete-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileKey }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            "Falha ao deletar o arquivo de áudio no armazenamento."
        );
      }

      const { error: dbError } = await supabase
        .from("episodes")
        .delete()
        .eq("id", episodeToDelete.id);

      if (dbError) throw dbError;

      toast({
        title: "Sucesso!",
        description: "Episódio excluído permanentemente.",
      });
      fetchEpisodes();
    } catch (error: any) {
      console.error("Erro ao excluir episódio:", error);
      toast({
        title: "Erro na exclusão",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando Episódios...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Buscando dados no servidor...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
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
                <TableHead
                  className="cursor-pointer"
                  onDoubleClick={() => setIsTitleSearchActive(true)}
                >
                  {isTitleSearchActive ? (
                    <Input
                      placeholder="Buscar pelo título..."
                      value={titleSearchTerm}
                      onChange={(e) => setTitleSearchTerm(e.target.value)}
                      onBlur={() => setIsTitleSearchActive(false)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === "Escape") {
                          setIsTitleSearchActive(false);
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      Título
                      {titleSearchTerm && (
                        <Badge variant="secondary">Filtro Ativo</Badge>
                      )}
                    </div>
                  )}
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    Categoria
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Filter className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem
                          onSelect={() => setSelectedCategoryId(null)}
                        >
                          Todas as Categorias
                        </DropdownMenuItem>
                        {categories.map((category) => (
                          <DropdownMenuItem
                            key={category.id}
                            onSelect={() => setSelectedCategoryId(category.id)}
                          >
                            {category.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {selectedCategoryId && (
                      <Badge variant="secondary">
                        {categories.find((c) => c.id === selectedCategoryId)
                          ?.name || "..."}
                      </Badge>
                    )}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    Publicado em
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setSortOrder({ ascending: !sortOrder.ascending })
                      }
                      className="h-6 w-6"
                    >
                      {sortOrder.ascending ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {episodes.length > 0 ? (
                episodes.map((episode) => (
                  <TableRow key={episode.id}>
                    <TableCell className="font-medium">
                      {episode.title}
                    </TableCell>
                    <TableCell>
                      {episode.categories ? (
                        <Badge variant="outline">
                          {episode.categories.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(episode.published_at), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
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
                            <Play className="mr-2 h-4 w-4" />
                            Tocar Episódio
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(episode)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full justify-start text-red-600 hover:text-red-600 p-2 h-auto font-normal"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Excluir
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Você tem certeza absoluta?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. Isso excluirá
                                  permanentemente o episódio "{episode.title}" e
                                  removerá seu arquivo de áudio do
                                  armazenamento.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(episode)}
                                >
                                  Sim, excluir episódio
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Nenhum episódio encontrado. Faça um upload para começar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EditEpisodeDialog
        episode={selectedEpisode}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onEpisodeUpdate={fetchEpisodes}
      />
    </>
  );
}
