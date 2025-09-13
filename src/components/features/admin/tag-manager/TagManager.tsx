"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { FileInput } from "./FileInput";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../ui/card";
import { useToast } from "@/src/hooks/use-toast";
import { createClient } from "@/src/lib/supabase-client";
import { Tag } from "@/src/lib/types";
import { TagList } from "@/src/components/features/admin/tag-manager/TagList";
import { TagFilters } from "@/src/components/features/admin/tag-manager/TagFilters";
import { TagForm } from "@/src/components/features/admin/tag-manager/TagForm";
import { TagActionsDialog } from "@/src/components/features/admin/tag-manager/TagActionsDialog";
import { TagMergeDialog } from "@/src/components/features/admin/tag-manager/TagMergeDialog";
import { TagBulkActions } from "@/src/components/features/admin/tag-manager/TagBulkActions";
import { TagPagination } from "@/src/components/features/admin/tag-manager/TagPagination";
import { TagWithCount, FilterMode } from "./types";
import { Button } from "@/src/components/ui/button";
import { Check, Download } from "lucide-react";

const TAGS_PER_PAGE = 25;

export function TagManager() {
  const supabase = createClient();
  const { toast } = useToast();

  // Estados principais
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [unusedTagCount, setUnusedTagCount] = useState(0);
  const [totalTagCount, setTotalTagCount] = useState(0);

  // Estados de seleção
  const [selectedTag, setSelectedTag] = useState<TagWithCount | null>(null);
  const [selectedTags, setSelectedTags] = useState<TagWithCount[]>([]);
  const [mainTag, setMainTag] = useState<TagWithCount | null>(null);

  // Estados de diálogo
  const [isMergeDialogOpen, setIsMergeDialogOpen] = useState(false);
  const [editTagName, setEditTagName] = useState("");

  // Função para ação na tag (preenche o campo imediatamente)
  const handleTagAction = (tag: TagWithCount | null) => {
    if (tag) {
      setSelectedTag(tag);
      setEditTagName(tag.name); // Preenche imediatamente
    } else {
      setSelectedTag(null);
      setEditTagName(""); // Limpa o campo
    }
  };

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

  // Handlers
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
    setSelectedTag(null);
  };

  const handleEditTag = async () => {
    if (!selectedTag || !editTagName.trim()) return;
    const { error } = await supabase
      .from("tags")
      .update({ name: editTagName.trim().toLowerCase() })
      .eq("id", selectedTag.id);
    if (error) {
      toast({
        title: "Erro ao atualizar tag",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Sucesso!", description: "Tag atualizada." });
      fetchGlobalCounts();
      fetchTags();
    }
    setSelectedTag(null);
    setEditTagName("");
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
  };

  const handleTagSelect = (tag: TagWithCount) => {
    if (selectedTags.find((t) => t.id === tag.id)) {
      setSelectedTags(selectedTags.filter((t) => t.id !== tag.id));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleMergeTags = async () => {
    if (!mainTag || selectedTags.length < 2) return;
    try {
      // 1. Obter todos os episódios que usam as tags selecionadas (exceto a principal)
      const { data: episodes, error: episodesError } = await supabase
        .from("episode_tags")
        .select("episode_id")
        .in(
          "tag_id",
          selectedTags
            .filter((tag) => tag.id !== mainTag.id)
            .map((tag) => tag.id)
        );
      if (episodesError) throw episodesError;

      // 2. Atualizar os episódios para usarem a tag principal
      if (episodes && episodes.length > 0) {
        const { error: updateError } = await supabase
          .from("episode_tags")
          .delete()
          .in(
            "episode_id",
            episodes.map((e) => e.episode_id)
          );
        if (updateError) throw updateError;

        const { error: insertError } = await supabase
          .from("episode_tags")
          .insert(
            episodes.map((episode) => ({
              episode_id: episode.episode_id,
              tag_id: mainTag.id,
            }))
          );
        if (insertError) throw insertError;
      }

      // 3. Excluir as tags antigas (exceto a principal)
      const { error: deleteError } = await supabase
        .from("tags")
        .delete()
        .in(
          "id",
          selectedTags
            .filter((tag) => tag.id !== mainTag.id)
            .map((tag) => tag.id)
        );
      if (deleteError) throw deleteError;

      // 4. Atualizar a interface
      toast({
        title: "Mesclagem concluída!",
        description: `${selectedTags.length - 1} tags foram mescladas em "${
          mainTag.name
        }".`,
      });

      // Resetar estados
      setSelectedTags([]);
      setMainTag(null);
      setIsMergeDialogOpen(false);
      fetchGlobalCounts();
      fetchTags();
    } catch (error: any) {
      toast({
        title: "Erro ao mesclar tags",
        description: error.message,
        variant: "destructive",
      });
    }
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
        {/* 
          <CardDescription className="mt-2">
          <div className="space-y-2">
            <p>
              <strong>Dica:</strong> Para mesclar tags, selecione duas ou mais
              tags e clique em "Mesclar Tags".
            </p>
            <p>
              <strong>Atenção:</strong> Esta ação é irreversível. Todas as
              associações de episódios serão atualizadas.
            </p>
          </div>
        </CardDescription> 
        */}
        <div className="flex flex-col gap-4 mt-4">
          {/* Adicionando os filtros de volta */}
          <TagFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterMode={filterMode}
            onFilterChange={setFilterMode}
            totalTagCount={totalTagCount}
            unusedTagCount={unusedTagCount}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <TagForm
              newTagName={newTagName}
              onTagNameChange={setNewTagName}
              onAddTag={handleAddTag}
            />
            <div className="flex space-x-2">
              <FileInput onFileChange={handleFileImport} />
              <Button
                variant="outline"
                onClick={handleExportTags}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" /> Exportar
              </Button>
            </div>
          </div>

          {unusedTagCount > 0 && (
            <div className="mt-2">
              <TagBulkActions
                unusedTagCount={unusedTagCount}
                onDeleteUnusedTags={handleDeleteUnusedTags}
                onImportTags={() => {
                  /* Função vazia, pois o FileInput lida com isso */
                }}
                onExportTags={handleExportTags}
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="border rounded-md p-4 space-y-2 min-h-[300px] max-h-[60vh] overflow-y-auto">
          <TagList
            tags={tags}
            loading={loading}
            filterMode={filterMode}
            selectedTags={selectedTags}
            onTagSelect={handleTagSelect}
            setSelectedTag={handleTagAction}
          />
        </div>

        {/* Botões de seleção e mesclagem */}
        {selectedTags.length > 0 && (
          <div className="mt-2">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-md">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700">
                  {selectedTags.length} tag(s) selecionada(s)
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTags([])}
                >
                  Limpar seleção
                </Button>
                {selectedTags.length > 1 && (
                  <Button
                    onClick={() => setIsMergeDialogOpen(true)}
                    className="text-sm"
                  >
                    Mesclar {selectedTags.length} Tags
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        <TagPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </CardContent>

      {/* Diálogos */}
      <TagActionsDialog
        tag={selectedTag}
        isOpen={!!selectedTag}
        onClose={() => {
          setSelectedTag(null);
          setEditTagName(""); // Limpa o campo ao fechar
        }}
        onEdit={handleEditTag}
        onDelete={handleDeleteTag}
      />

      <TagMergeDialog
        selectedTags={selectedTags}
        mainTag={mainTag}
        isOpen={isMergeDialogOpen}
        onClose={() => setIsMergeDialogOpen(false)}
        onMainTagChange={setMainTag}
        onMerge={handleMergeTags}
      />
    </Card>
  );
}
