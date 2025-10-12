// src/components/features/admin/admin-upload-form.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import RichTextEditor from "../../ui/RichTextEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { Calendar } from "@/src/components/ui/calendar";
import { TagSelector } from "../admin/TagSelector";
import {
  Upload,
  CheckCircle,
  StopCircle,
  XCircle,
  CalendarDays,
} from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";
import { cn } from "@/src/lib/utils";
import { useEpisodeUpload } from "@/src/hooks/useEpisodeUpload";
import { createTagAction } from "@/src/app/admin/tags/actions";
import { Tag } from "@/src/lib/types";
import { toast } from "@/src/lib/safe-toast";

export function UploadForm() {
  const { toast: legacyToast } = useToast();
  const router = useRouter();

  const [justFinished, setJustFinished] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(
    new Date()
  );

  const {
    form,
    setForm,
    audioFile,
    setAudioFile,
    documentFile,
    setDocumentFile,
    docPageCount,
    setDocPageCount,
    docReferenceCount,
    setDocReferenceCount,
    data: { categories, programs, tags, subcategories },
    selectedCategory,
    setSelectedCategory,
    selectedProgram,
    setSelectedProgram,
    filteredSubcategories,
    selectedTagIds,
    setSelectedTagIds,
    createAndSelectTag,
    upload: { phase, audioProgress, documentProgress, audioDuration },
    submit,
    cancelAudioUpload,
    cancelDocumentUpload,
    resetAll,
    isBusy,
    readablePhaseMessage,
    lastError,
    buildUserMessage,
  } = useEpisodeUpload({
    onSuccess: (episode) => {
      setTimeout(() => {
        toast.success("Sucesso!", {
          description: `Episódio "${episode.title}" criado.`,
        });
      }, 50);

      router.refresh();
      if (episode.status === "scheduled") {
        router.push("/schedule");
      }
      setJustFinished(true);
    },
    onError: (msg) => {
      setTimeout(() => {
        toast.error("Falha", {
          description: msg,
        });
      }, 50);
    },
  });

  useEffect(() => {
    if (phase !== "finished" && justFinished) {
      setJustFinished(false);
    }
  }, [phase, justFinished]);

  const isFinished = phase === "finished";
  const isError = phase === "error";

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAudioFile(file);
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setDocumentFile(null);
      setDocPageCount("");
      setDocReferenceCount("");
      return;
    }
    const allowed = [".pdf", ".doc", ".docx"];
    const lower = file.name.toLowerCase();
    if (!allowed.some((ext) => lower.endsWith(ext))) {
      legacyToast({
        title: "Formato inválido",
        description: `Use: ${allowed.join(", ")}`,
        variant: "destructive",
      });
      return;
    }
    setDocumentFile(file);
  };

  function dismissError() {
    resetAll();
    setJustFinished(false);
  }

  const handleConfirmSchedule = () => {
    if (!scheduleDate) {
      toast.error("Data inválida", {
        description: "Por favor, selecione uma data para agendar.",
      });
      return;
    }
    setForm((prev) => ({ ...prev, publishedAt: scheduleDate.toISOString() }));
    submit("scheduled");
    setIsScheduleDialogOpen(false);
  };

  const handleCreateTag = (incoming: Tag) => {
    (async () => {
      const rawName = incoming?.name || "";
      const name = rawName.trim().toLowerCase();
      if (!name) return;

      const existingById = tags.find((t) => t.id === incoming.id);
      if (existingById) {
        setSelectedTagIds((prev) =>
          prev.includes(existingById.id) ? prev : [...prev, existingById.id]
        );
        return;
      }

      const existingByName = tags.find(
        (t) => t.name.toLowerCase() === name.toLowerCase()
      );
      if (existingByName) {
        setSelectedTagIds((prev) =>
          prev.includes(existingByName.id) ? prev : [...prev, existingByName.id]
        );
        return;
      }

      const res = await createTagAction({ name, groupId: null });
      if (!res.success) {
        toast.error("Erro ao criar tag", {
          description: res.error,
        });
        return;
      }

      createAndSelectTag({
        id: res.tag.id,
        name: res.tag.name,
        created_at: res.tag.created_at,
      });
    })().catch((e) => {
      toast.error("Erro inesperado", {
        description: e?.message || "Falha ao criar tag.",
      });
    });
  };

  return (
    <div className="w-full h-full p-4 md:p-6">
      {justFinished && phase === "finished" && (
        <div
          className="mb-6 flex items-center justify-between rounded-xl border border-green-500/30 bg-green-500/5 p-5 text-sm text-green-700 dark:text-green-400 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-bottom-5 duration-500"
          role="status"
          aria-live="polite"
        >
          <span className="flex items-center gap-3 font-semibold">
            <CheckCircle className="h-6 w-6" />
            Episódio criado com sucesso!
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                resetAll();
                setJustFinished(false);
              }}
              className="border-green-500/30"
            >
              Novo upload
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setJustFinished(false)}
            >
              Fechar
            </Button>
          </div>
        </div>
      )}

      <Card className="overflow-hidden border-border/50 bg-card/95 backdrop-blur-sm">
        <CardHeader className="border-b bg-black/10 p-6">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold tracking-tight">
            Novo Episódio
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          {lastError && (
            <div
              role="alert"
              aria-live="polite"
              className={cn(
                "relative rounded-xl border px-5 py-4 text-sm shadow-md animate-in fade-in slide-in-from-top-2 duration-300",
                lastError.severity === "warning"
                  ? "border-yellow-500/30 bg-yellow-500/5 text-yellow-700 dark:text-yellow-400"
                  : "border-destructive/30 bg-destructive/5 text-destructive"
              )}
            >
              <div className="flex items-start gap-3 pr-6">
                <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="font-semibold">
                    {lastError.severity === "warning" ? "Aviso" : "Erro"}
                  </p>
                  <p className="text-base">{buildUserMessage(lastError)}</p>
                </div>
                <button
                  type="button"
                  onClick={dismissError}
                  className="absolute right-2 top-2 rounded p-1.5 text-xs hover:bg-black/10 transition-colors"
                  aria-label="Fechar alerta"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="title" className="text-lg font-semibold">
                  Título do Episódio
                </Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="h-12 text-base"
                  disabled={isBusy}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-lg font-semibold">Descrição</Label>
                <div className="rounded-lg border bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                  <RichTextEditor
                    content={form.description}
                    onChange={(newContent) =>
                      setForm((prev) => ({
                        ...prev,
                        description: newContent,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-lg font-semibold">Tags</Label>
                <TagSelector
                  allTags={tags}
                  value={selectedTagIds}
                  onChange={setSelectedTagIds}
                  onCreateTag={handleCreateTag}
                  placeholder="Adicione tags para organizar..."
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-lg font-semibold">
                  Arquivo de Áudio (.m4a)
                </Label>
                <div
                  className={cn(
                    "relative rounded-lg border-2 bg-muted/20 p-4 transition-all duration-300",
                    audioFile
                      ? "border-solid border-primary/50 bg-primary/5"
                      : "border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5"
                  )}
                >
                  <input
                    type="file"
                    accept="audio/*"
                    className="absolute inset-0 w-full h-full cursor-pointer opacity-0 z-10"
                    disabled={isBusy}
                    onChange={handleAudioChange}
                  />
                  {!audioFile ? (
                    <div className="w-full text-center">
                      <p className="text-sm text-muted-foreground">
                        Clique para selecionar ou arraste o arquivo de áudio
                        aqui
                      </p>
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-between">
                      <p className="truncate font-medium pr-2">
                        {audioFile.name}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        // CORREÇÃO: Adicionado z-index para colocar o botão por cima do input
                        className="relative z-20 h-8 w-8 p-0 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAudioFile(null);
                        }}
                        disabled={isBusy}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {audioFile && phase === "audio-uploading" && (
                    <div className="mt-3 space-y-2">
                      <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300 ease-out"
                          style={{ width: `${audioProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        {Math.floor(audioProgress)}%
                      </p>
                    </div>
                  )}
                  {audioFile && audioDuration && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Duração: {Math.floor(audioDuration / 60)}:
                      {String(Math.floor(audioDuration % 60)).padStart(2, "0")}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-base font-medium">Programa</Label>
                  <Select
                    value={form.programId}
                    onValueChange={(value) => {
                      if (value === "nenhum") {
                        setSelectedProgram(null);
                        setForm((prev) => ({ ...prev, programId: "" }));
                      } else {
                        const prog =
                          programs.find((p) => p.id === value) || null;
                        setSelectedProgram(prog);
                        setForm((prev) => ({ ...prev, programId: value }));
                      }
                    }}
                    disabled={isBusy}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nenhum">Nenhum</SelectItem>
                      {programs.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium">Episódio Nº</Label>
                  <Input
                    id="episode-number"
                    type="number"
                    value={form.episodeNumber}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        episodeNumber: e.target.value,
                      }))
                    }
                    placeholder="Ex: 01"
                    disabled={!form.programId || isBusy}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-base font-medium">Categoria</Label>
                  <Select
                    value={form.categoryId}
                    onValueChange={(value) => {
                      setForm((prev) => ({
                        ...prev,
                        categoryId: value,
                        subcategoryId: "",
                      }));
                      setSelectedCategory(value);
                    }}
                    disabled={!!selectedProgram || isBusy}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium">Subcategoria</Label>
                  <Select
                    value={form.subcategoryId}
                    onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, subcategoryId: value }))
                    }
                    disabled={
                      !selectedCategory ||
                      filteredSubcategories.length === 0 ||
                      isBusy
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          !selectedCategory ? "Indisponível" : "Selecione"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSubcategories.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-lg font-semibold">
                  Documento de Apoio (.PDF)
                </Label>
                <div
                  className={cn(
                    "relative rounded-lg border-2 bg-muted/20 p-4 transition-all duration-300",
                    documentFile
                      ? "border-solid border-primary/50 bg-primary/5"
                      : "border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5"
                  )}
                >
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="absolute inset-0 w-full h-full cursor-pointer opacity-0 z-10"
                    onChange={handleDocumentChange}
                    disabled={
                      isBusy &&
                      phase !== "audio-done" &&
                      phase !== "finished" &&
                      phase !== "error"
                    }
                  />
                  {!documentFile ? (
                    <div className="w-full text-center">
                      <p className="text-sm text-muted-foreground">
                        Clique para anexar ou arraste o documento aqui
                      </p>
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-between">
                      <p className="truncate font-medium pr-2">
                        {documentFile.name}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        // CORREÇÃO: Adicionado z-index para colocar o botão por cima do input
                        className="relative z-20 h-8 w-8 p-0 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDocumentFile(null);
                          setDocPageCount("");
                          setDocReferenceCount("");
                        }}
                        disabled={
                          isBusy &&
                          phase !== "audio-done" &&
                          phase !== "finished" &&
                          phase !== "error"
                        }
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {documentFile &&
                    (phase === "document-uploading" ||
                      phase === "document-registering" ||
                      documentProgress > 0) && (
                      <div className="mt-3 space-y-2">
                        <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300 ease-out"
                            style={{
                              width: `${
                                phase === "document-registering"
                                  ? 100
                                  : Math.min(documentProgress, 100)
                              }%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                          {phase === "document-preparing" && "Preparando..."}
                          {phase === "document-uploading" &&
                            `${Math.floor(documentProgress)}%`}
                          {phase === "document-registering" && "Registrando..."}
                        </p>
                      </div>
                    )}
                  {documentFile && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Páginas
                        </label>
                        <Input
                          type="number"
                          min={0}
                          value={docPageCount}
                          onChange={(e) => setDocPageCount(e.target.value)}
                          disabled={isBusy}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Referências
                        </label>
                        <Input
                          type="number"
                          min={0}
                          value={docReferenceCount}
                          onChange={(e) => setDocReferenceCount(e.target.value)}
                          disabled={isBusy}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t bg-muted/30 p-6">
          <div className="w-full ml-auto flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => submit("draft")}
              disabled={isBusy || !audioFile || !form.title.trim()}
            >
              Salvar Rascunho
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsScheduleDialogOpen(true)}
              disabled={isBusy || !audioFile || !form.title.trim()}
              className="flex items-center gap-2"
            >
              <CalendarDays className="h-4 w-4" />
              Agendar
            </Button>
            <Button
              type="button"
              onClick={() => submit("published")}
              disabled={isBusy || !audioFile || !form.title.trim()}
              size="lg"
            >
              {phase === "idle" && "Publicar Agora"}
              {isFinished && "Publicado!"}
              {phase !== "idle" && !isFinished && !isError && "Processando..."}
              {isError && "Tentar Novamente"}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CalendarDays className="h-5 w-5" />
              Agendar Publicação
            </DialogTitle>
            <DialogDescription>
              Escolha uma data para publicar o episódio automaticamente.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <Calendar
              mode="single"
              selected={scheduleDate}
              onSelect={setScheduleDate}
              className="rounded-lg border"
              disabled={(date) =>
                date < new Date(new Date().setDate(new Date().getDate() - 1))
              }
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsScheduleDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirmSchedule}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
