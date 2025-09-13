"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";
import { createClient } from "../../../lib/supabase-client";
import { Tag } from "../../../lib/types";
import { useToast } from "../../../hooks/use-toast";
import { Plus, Search, Download, Upload, Trash2 } from "lucide-react";
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
} from "../../ui/alert-dialog";
import { Badge } from "../../ui/badge";
import { cn } from "../../../lib/utils";
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "../../ui/pagination";
import { Skeleton } from "../../ui/skeleton";

type TagWithCount = Tag & {
  episode_count: number;
};

const TAGS_PER_PAGE = 50;

export function TagManager() {
  const supabase = createClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "used" | "unused">(
    "all"
  );
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [unusedTagCount, setUnusedTagCount] = useState(0);
  const [totalTagCount, setTotalTagCount] = useState(0);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterMode]);

  // Fetch global counts (total tags and unused tags)
  const fetchGlobalCounts = useCallback(async () => {
    // Get total count of all tags
    const { count: totalCount, error: totalError } = await supabase
      .from("tags")
      .select("*", { count: "exact", head: true });

    if (!totalError) {
      setTotalTagCount(totalCount || 0);
    }

    // Get count of unused tags (tags with no episode associations)
    const { data: allTags, error: tagsError } = await supabase.from("tags")
      .select(`
        id,
        episode_tags(count)
      `);

    if (!tagsError && allTags) {
      const unusedCount = allTags.filter((tag) => {
        const count = tag.episode_tags?.[0]?.count || 0;
        return count === 0;
      }).length;
      setUnusedTagCount(unusedCount);
    }
  }, [supabase]);

  // Fetch paginated tags based on current filters
  const fetchTags = useCallback(async () => {
    setLoading(true);

    // First, get all tags with their counts to properly filter
    let baseQuery = supabase.from("tags").select(`
        *,
        episode_tags(count)
      `);

    // Apply search filter if needed
    if (debouncedSearchTerm) {
      baseQuery = baseQuery.ilike("name", `%${debouncedSearchTerm}%`);
    }

    const { data: allFilteredTags, error: fetchError } = await baseQuery.order(
      "name"
    );

    if (fetchError) {
      console.error("Error fetching tags:", fetchError);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as tags.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Process tags to add episode count
    const processedTags: TagWithCount[] = (allFilteredTags || []).map(
      (tag) => ({
        ...tag,
        episode_count: tag.episode_tags?.[0]?.count || 0,
      })
    );

    // Apply filter mode
    let filteredTags = processedTags;
    if (filterMode === "used") {
      filteredTags = processedTags.filter((tag) => tag.episode_count > 0);
    } else if (filterMode === "unused") {
      filteredTags = processedTags.filter((tag) => tag.episode_count === 0);
    }

    // Set total count for pagination
    setTotalCount(filteredTags.length);

    // Apply pagination
    const from = (currentPage - 1) * TAGS_PER_PAGE;
    const to = from + TAGS_PER_PAGE;
    const paginatedTags = filteredTags.slice(from, to);

    setTags(paginatedTags);
    setLoading(false);
  }, [supabase, toast, currentPage, debouncedSearchTerm, filterMode]);

  // Initial load
  useEffect(() => {
    fetchGlobalCounts();
    fetchTags();
  }, [fetchGlobalCounts, fetchTags]);

  const totalPages = Math.ceil(totalCount / TAGS_PER_PAGE);

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;

    const { data, error } = await supabase
      .from("tags")
      .insert([{ name: newTagName.trim().toLowerCase() }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro ao criar tag",
        description: "Talvez essa tag já exista.",
        variant: "destructive",
      });
    } else {
      setNewTagName("");
      toast({ title: "Sucesso!", description: "Tag criada." });
      fetchGlobalCounts();
      fetchTags();
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    const { error } = await supabase.from("tags").delete().eq("id", tagId);

    if (error) {
      toast({
        title: "Erro ao excluir tag",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Sucesso!", description: "Tag excluída." });
      fetchGlobalCounts();
      fetchTags();
    }
  };

  const handleDeleteUnusedTags = async () => {
    // Get all unused tags (not paginated)
    const { data: allTags, error: fetchError } = await supabase.from("tags")
      .select(`
        id,
        episode_tags(count)
      `);

    if (fetchError || !allTags) {
      toast({
        title: "Erro ao buscar tags",
        description: fetchError?.message,
        variant: "destructive",
      });
      return;
    }

    // Filter to get only unused tags
    const unusedTags = allTags.filter((tag) => {
      const count = tag.episode_tags?.[0]?.count || 0;
      return count === 0;
    });

    if (unusedTags.length === 0) {
      toast({
        title: "Nenhuma tag para excluir",
        description: "Todas as tags estão em uso.",
      });
      return;
    }

    const tagsToDelete = unusedTags.map((tag) => tag.id);

    const { error: deleteError } = await supabase
      .from("tags")
      .delete()
      .in("id", tagsToDelete);

    if (deleteError) {
      toast({
        title: "Erro ao excluir tags",
        description: deleteError.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Limpeza concluída!",
        description: `${tagsToDelete.length} tags não utilizadas foram excluídas.`,
      });
      fetchGlobalCounts();
      fetchTags();
    }
  };

  const handleExportTags = async () => {
    const { data: tagsToExport, error } = await supabase
      .from("tags")
      .select("name")
      .order("name");

    if (error) {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível buscar as tags.",
        variant: "destructive",
      });
      return;
    }

    const csvHeader = "name\n";
    const csvRows = tagsToExport
      .map((tag) => `"${tag.name.replace(/"/g, '""')}"`)
      .join("\n");

    const encoder = new TextEncoder();
    const csvContent = encoder.encode("\uFEFF" + csvHeader + csvRows);

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "playcast_tags.csv");
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const handleFileImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
        const hasHeader = lines[0].toLowerCase() === "name";
        const tagNames = (hasHeader ? lines.slice(1) : lines)
          .map((name) => name.replace(/^"|"$/g, "").trim().toLowerCase())
          .filter(Boolean);

        if (tagNames.length === 0) {
          toast({ title: "Arquivo vazio ou inválido", variant: "destructive" });
          return;
        }

        const uniqueTagNames = [...new Set(tagNames)];

        const { data: existingTags, error: fetchError } = await supabase
          .from("tags")
          .select("name")
          .in("name", uniqueTagNames);

        if (fetchError) throw fetchError;

        const existingTagNames = new Set(
          existingTags?.map((t) => t.name) || []
        );
        const newTagsToInsert = uniqueTagNames
          .filter((name) => !existingTagNames.has(name))
          .map((name) => ({ name }));

        if (newTagsToInsert.length === 0) {
          toast({
            title: "Nenhuma nova tag para importar",
            description: "Todas as tags do arquivo já existem.",
          });
          return;
        }

        const { error: insertError } = await supabase
          .from("tags")
          .insert(newTagsToInsert);

        if (insertError) throw insertError;

        toast({
          title: "Importação concluída!",
          description: `${newTagsToInsert.length} novas tags foram adicionadas.`,
        });
        fetchGlobalCounts();
        fetchTags();
      } catch (error: any) {
        toast({
          title: "Erro ao processar arquivo",
          description: error.message,
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciador de Tags</CardTitle>
        <CardDescription>
          Atualmente, existem <strong>{totalTagCount}</strong> tags cadastradas.{" "}
          <span className="text-red-500">{unusedTagCount}</span> não estão em
          uso.
        </CardDescription>

        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <ToggleGroup
              type="single"
              value={filterMode}
              onValueChange={(value: "all" | "used" | "unused") => {
                if (value) setFilterMode(value);
              }}
              className="justify-start"
            >
              <ToggleGroupItem value="all">Todas</ToggleGroupItem>
              <ToggleGroupItem value="used">Utilizadas</ToggleGroupItem>
              <ToggleGroupItem value="unused">Não Utilizadas</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex space-x-2">
              <Input
                placeholder="Nome da nova tag"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              />
              <Button onClick={handleAddTag}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar
              </Button>
            </div>
            <div className="flex space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv,.txt"
                onChange={handleFileImport}
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" /> Importar
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleExportTags}
              >
                <Download className="mr-2 h-4 w-4" /> Exportar
              </Button>
            </div>
          </div>

          {unusedTagCount > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full sm:w-auto">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Limpar {unusedTagCount} Tags Não Usadas
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá
                    permanentemente {unusedTagCount} tags que não estão
                    associadas a nenhum episódio.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteUnusedTags}>
                    Sim, excluir tags
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="border rounded-md p-4 space-y-2 min-h-[300px] max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 15 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-24 rounded-full" />
              ))}
            </div>
          ) : tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <AlertDialog key={tag.id}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertDialogTrigger asChild>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "cursor-pointer hover:bg-destructive/80 transition-colors",
                              {
                                "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300":
                                  tag.episode_count === 0,
                              }
                            )}
                          >
                            {tag.name} ({tag.episode_count})
                          </Badge>
                        </AlertDialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {tag.episode_count === 0 ? "Tag não utilizada. " : ""}
                          Clique para excluir.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Excluir a tag "{tag.name}"?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. A tag será removida de
                        todos os episódios que a utilizam ({tag.episode_count}{" "}
                        episódios).
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteTag(tag.id)}
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma tag encontrada para o filtro selecionado.
            </p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((p) => Math.max(1, p - 1));
                    }}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="text-sm px-4">
                    Página {currentPage} de {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
