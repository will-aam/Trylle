// src/components/features/admin/tag-manager/TagManager.tsx
"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Check, Download } from "lucide-react";
import { toast } from "@/src/lib/safe-toast"; // <-- Importação correta

import { FileInput } from "./FileInput";
import { TagFilters } from "./TagFilters";
import { TagForm } from "./TagForm";
import { TagList } from "./TagList";
import { TagActionsDialog } from "./TagActionsDialog";
import { TagMergeDialog } from "./TagMergeDialog";
import { TagPagination } from "./TagPagination";

import {
  listTagsAction,
  getTagGlobalStatsAction,
  listTagGroupsAction,
  createTagAction,
  updateTagAction,
  deleteTagAction,
  deleteUnusedTagsAction,
  mergeTagsAction,
  bulkImportTagsAction,
  listAllTagNamesAction,
} from "@/src/app/admin/tags/actions";

import { Tag } from "@/src/lib/types";
import { TagWithCount, FilterMode, TagGroup } from "./types";

const TAGS_PER_PAGE = 25;

export function TagManager() {
  // Estados principais
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Filtros / controle
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalFiltered, setTotalFiltered] = useState(0);

  // Estatísticas globais
  const [totalTagCount, setTotalTagCount] = useState(0);
  const [unusedTagCount, setUnusedTagCount] = useState(0);

  // Grupos
  const [tagGroups, setTagGroups] = useState<TagGroup[]>([]);

  // Criação / edição
  const [newTagName, setNewTagName] = useState("");
  const [selectedTag, setSelectedTag] = useState<TagWithCount | null>(null);
  const [editTagName, setEditTagName] = useState("");

  // Seleção múltipla / mesclagem
  const [selectedTags, setSelectedTags] = useState<TagWithCount[]>([]);
  const [mainTag, setMainTag] = useState<TagWithCount | null>(null);
  const [isMergeDialogOpen, setIsMergeDialogOpen] = useState(false);

  /* Debounce de busca */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  /* Reset de página quando busca ou filtro mudam */
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterMode]);

  /* Carregar estatísticas globais */
  const loadStats = useCallback(async () => {
    const res = await getTagGlobalStatsAction();
    if (res.success) {
      setTotalTagCount(res.total);
      setUnusedTagCount(res.unused);
    } else {
      toast.error("Erro ao obter estatísticas", {
        description: res.error,
      });
    }
  }, []);

  /* Carregar grupos de tag */
  const loadGroups = useCallback(async () => {
    const res = await listTagGroupsAction();
    if (res.success) {
      setTagGroups(res.data);
    } else {
      toast.error("Erro ao carregar grupos", {
        description: res.error,
      });
    }
  }, []);

  /* Carregar tags (paginado) */
  const loadTags = useCallback(
    async (opts?: { page?: number }) => {
      setLoading(true);
      const res = await listTagsAction({
        page: opts?.page ?? currentPage,
        perPage: TAGS_PER_PAGE,
        search: debouncedSearchTerm,
        filterMode,
      });
      if (res.success) {
        // mapear para TagWithCount
        const mapped: TagWithCount[] = res.data.map((t) => ({
          id: t.id,
          name: t.name,
          created_at: t.created_at,
          group_id: t.group_id,
          episode_count: t.episode_count,
        }));
        setTags(mapped);
        setTotalFiltered(res.totalFiltered);
      } else {
        toast.error("Erro ao listar tags", {
          description: res.error,
        });
      }
      setLoading(false);
    },
    [currentPage, debouncedSearchTerm, filterMode]
  );

  /* Carregamento inicial e quando dependências mudam */
  useEffect(() => {
    // Executar em paralelo
    startTransition(() => {
      Promise.all([loadStats(), loadGroups(), loadTags()]).catch(() => {});
    });
  }, [loadStats, loadGroups, loadTags]);

  const totalPages = Math.ceil(totalFiltered / TAGS_PER_PAGE) || 1;

  const refreshAll = async () => {
    await Promise.all([loadStats(), loadTags()]);
  };

  /* Ações CRUD */

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    const res = await createTagAction({
      name: newTagName.trim().toLowerCase(),
      groupId: null,
    });
    if (!res.success) {
      toast.error("Erro ao criar tag", {
        description: res.error,
      });
      return;
    }
    setNewTagName("");
    toast.success("Sucesso!", { description: "Tag criada." });
    await refreshAll();
  };

  const handleDeleteTag = async (tagId: string) => {
    const res = await deleteTagAction(tagId);
    if (!res.success) {
      toast.error("Erro ao excluir tag", {
        description: res.error,
      });
    } else {
      toast.success("Sucesso!", { description: "Tag excluída." });
      await refreshAll();
    }
    setSelectedTag(null);
  };

  const handleEditTag = async (
    tagId: string,
    newName: string,
    groupId: string | null
  ) => {
    if (!tagId || !newName.trim()) return;
    const res = await updateTagAction({
      id: tagId,
      name: newName.trim(),
      groupId: groupId || null,
    });
    if (!res.success) {
      toast.error("Erro ao atualizar tag", {
        description: res.error,
      });
    } else {
      toast.success("Sucesso!", { description: "Tag atualizada." });
      await refreshAll();
    }
    setSelectedTag(null);
  };

  const handleDeleteUnusedTags = async () => {
    const res = await deleteUnusedTagsAction();
    if (!res.success) {
      toast.error("Erro ao excluir tags", {
        description: res.error,
      });
    } else if (res.deleted === 0) {
      toast.info("Nenhuma tag para excluir", {
        description: "Todas as tags estão em uso.",
      });
    } else {
      toast.success("Limpeza concluída!", {
        description: `${res.deleted} tags não utilizadas foram excluídas.`,
      });
      await refreshAll();
    }
  };

  const handleFileImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = (e.target?.result as string) || "";
        const lines = text
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        const hasHeader = lines[0]?.toLowerCase() === "name";
        const names = (hasHeader ? lines.slice(1) : lines)
          .map((n) => n.replace(/^"|"$/g, "").trim())
          .filter(Boolean);
        if (names.length === 0) {
          toast.error("Arquivo vazio ou inválido");
          return;
        }
        const res = await bulkImportTagsAction({ names });
        if (!res.success) {
          toast.error("Erro na importação", {
            description: res.error,
          });
        } else {
          toast.success("Importação concluída!", {
            description: `${res.inserted} inseridas, ${res.skipped} ignoradas.`,
          });
          await refreshAll();
        }
      } catch (err: any) {
        toast.error("Erro ao processar arquivo", {
          description: err.message,
        });
      }
    };
    reader.readAsText(file);
  };

  const handleExportTags = async () => {
    const res = await listAllTagNamesAction();
    if (!res.success) {
      toast.error("Erro ao exportar", {
        description: res.error,
      });
      return;
    }
    const csvHeader = "name\n";
    const csvRows = res.data
      .map((tag) => `"${tag.name.replace(/"/g, '""')}"`)
      .join("\n");
    const encoder = new TextEncoder();
    const csvContent = encoder.encode("\uFEFF" + csvHeader + csvRows);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = "Trylle_tags.csv";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const handleTagSelect = (tag: TagWithCount) => {
    setSelectedTags((prev) =>
      prev.find((t) => t.id === tag.id)
        ? prev.filter((t) => t.id !== tag.id)
        : [...prev, tag]
    );
  };

  const handleMergeTags = async () => {
    if (!mainTag || selectedTags.length < 2) return;
    const otherIds = selectedTags
      .filter((t) => t.id !== mainTag.id)
      .map((t) => t.id);
    if (otherIds.length === 0) return;

    const res = await mergeTagsAction({
      mainTagId: mainTag.id,
      otherTagIds: otherIds,
    });

    if (!res.success) {
      toast.error("Erro ao mesclar tags", {
        description: res.error,
      });
    } else {
      toast.success("Mesclagem concluída!", {
        description: `${res.merged} tags foram mescladas em "${mainTag.name}".`,
      });
      setSelectedTags([]);
      setMainTag(null);
      setIsMergeDialogOpen(false);
      await refreshAll();
    }
  };

  const handleTagAction = (tag: TagWithCount | null) => {
    if (tag) {
      setSelectedTag(tag);
      setEditTagName(tag.name);
    } else {
      setSelectedTag(null);
      setEditTagName("");
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    // fetch tags para a página nova
    loadTags({ page }).catch(() => {});
  };

  const busy = loading || isPending;

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
              disabled={busy}
            />
            <div className="flex space-x-2">
              <FileInput onFileChange={handleFileImport} disabled={busy} />
              <Button
                variant="outline"
                onClick={handleExportTags}
                className="w-full"
                disabled={busy}
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
            loading={busy}
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
          onPageChange={handlePageChange}
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
        onDelete={handleDeleteTag} // <-- CORREÇÃO: Prop corrigida
        tagGroups={tagGroups}
        editTagName={editTagName}
        onEditTagNameChange={setEditTagName}
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
