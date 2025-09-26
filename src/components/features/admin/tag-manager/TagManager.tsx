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
// 1. AQUI ESTÁ A MUDANÇA: Importe a nova função
import { createSupabaseBrowserClient } from "@/src/lib/supabase-client";
import { Tag } from "@/src/lib/types";
import { TagList } from "@/src/components/features/admin/tag-manager/TagList";
import { TagFilters } from "@/src/components/features/admin/tag-manager/TagFilters";
import { TagForm } from "@/src/components/features/admin/tag-manager/TagForm";
import { TagActionsDialog } from "@/src/components/features/admin/tag-manager/TagActionsDialog";
import { TagMergeDialog } from "@/src/components/features/admin/tag-manager/TagMergeDialog";
import { TagPagination } from "@/src/components/features/admin/tag-manager/TagPagination";
import { TagWithCount, FilterMode, TagGroup } from "./types";
import { Button } from "../../../ui/button";
import { Check, Download } from "lucide-react";

const TAGS_PER_PAGE = 25;

export function TagManager() {
  // 2. E AQUI: Use a nova função para criar o cliente
  const supabase = createSupabaseBrowserClient();
  const { toast } = useToast();

  // O resto do seu código permanece exatamente o mesmo.

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
  const [tagGroups, setTagGroups] = useState<TagGroup[]>([]);
  const [selectedTag, setSelectedTag] = useState<TagWithCount | null>(null);
  const [selectedTags, setSelectedTags] = useState<TagWithCount[]>([]);
  const [mainTag, setMainTag] = useState<TagWithCount | null>(null);
  const [isMergeDialogOpen, setIsMergeDialogOpen] = useState(false);
  const [editTagName, setEditTagName] = useState("");

  const handleTagAction = (tag: TagWithCount | null) => {
    if (tag) {
      setSelectedTag(tag);
      setEditTagName(tag.name);
    } else {
      setSelectedTag(null);
      setEditTagName("");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterMode]);

  const fetchGlobalCounts = useCallback(async () => {
    const { count: totalCount, error: totalError } = await supabase
      .from("tags")
      .select("*", { count: "exact", head: true });
    if (!totalError) {
      setTotalTagCount(totalCount || 0);
    }

    const { data: allTags, error: tagsError } = await supabase
      .from("tags")
      .select(`id, episode_tags(count)`);
    if (!tagsError && allTags) {
      const unusedCount = allTags.filter((tag) => {
        const count = tag.episode_tags?.[0]?.count || 0;
        return count === 0;
      }).length;
      setUnusedTagCount(unusedCount);
    }
  }, [supabase]);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    let baseQuery = supabase.from("tags").select(`*, episode_tags(count)`);

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

    const processedTags: TagWithCount[] = (allFilteredTags || []).map(
      (tag) => ({
        ...tag,
        episode_count: tag.episode_tags?.[0]?.count || 0,
      })
    );

    let filteredTags = processedTags;
    if (filterMode === "used") {
      filteredTags = processedTags.filter((tag) => tag.episode_count > 0);
    } else if (filterMode === "unused") {
      filteredTags = processedTags.filter((tag) => tag.episode_count === 0);
    }

    setTotalCount(filteredTags.length);

    const from = (currentPage - 1) * TAGS_PER_PAGE;
    const to = from + TAGS_PER_PAGE;
    const paginatedTags = filteredTags.slice(from, to);
    setTags(paginatedTags);
    setLoading(false);
  }, [supabase, toast, currentPage, debouncedSearchTerm, filterMode]);

  useEffect(() => {
    const fetchGroups = async () => {
      const { data, error } = await supabase
        .from("tag_groups")
        .select("id, name")
        .order("name");
      if (!error) {
        setTagGroups(data || []);
      }
    };
    fetchGlobalCounts();
    fetchTags();
    fetchGroups();
  }, [fetchGlobalCounts, fetchTags, supabase]);

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
    setSelectedTag(null);
  };

  const handleEditTag = async (
    tagId: string,
    newName: string,
    groupId: string | null
  ) => {
    if (!tagId || !newName.trim()) return;
    const { error } = await supabase
      .from("tags")
      .update({ name: newName.trim().toLowerCase(), group_id: groupId })
      .eq("id", tagId);
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
  };

  const handleDeleteUnusedTags = async () => {
    const { data: allTags, error: fetchError } = await supabase
      .from("tags")
      .select(`id, episode_tags(count)`);
    if (fetchError || !allTags) {
      toast({
        title: "Erro ao buscar tags",
        description: fetchError?.message,
        variant: "destructive",
      });
      return;
    }

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
    link.setAttribute("download", "Trylle_tags.csv");
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

      toast({
        title: "Mesclagem concluída!",
        description: `${selectedTags.length - 1} tags foram mescladas em "${
          mainTag.name
        }".`,
      });

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
        <div className="flex flex-col gap-4 mt-4">
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
              unusedTagCount={unusedTagCount}
              onDeleteUnusedTags={handleDeleteUnusedTags}
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
            onDeleteTag={handleDeleteTag}
          />
        </div>

        {selectedTags.length > 0 && (
          <div className="mt-2">
            <div className="flex justify-between items-center p-3 rounded-md">
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

      <TagActionsDialog
        tag={selectedTag}
        isOpen={!!selectedTag}
        onClose={() => {
          setSelectedTag(null);
          setEditTagName("");
        }}
        onEdit={handleEditTag}
        onDelete={handleDeleteTag}
        tagGroups={tagGroups}
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
