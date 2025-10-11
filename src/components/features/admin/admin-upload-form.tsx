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
  Music,
  FileText,
  XCircle,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  FileAudio,
  File,
  Hash,
  Tags,
  Mic,
  BookOpen,
} from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";
import { cn } from "@/src/lib/utils";
import { useEpisodeUpload } from "@/src/hooks/useEpisodeUpload";
import { createTagAction } from "@/src/app/admin/tags/actions";
import { Tag } from "@/src/lib/types";

/**
 * Formulário de criação de episódio (upload).
 * - Suporte a criação persistente de tags
 * - Banner de sucesso persistente até ação do usuário
 * - Controle de fases de upload (áudio + documento opcional)
 */
export function UploadForm() {
  const { toast } = useToast();
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
      toast({
        title: "Sucesso!",
        description: `Episódio "${episode.title}" criado.`,
      });
      router.refresh();
      if (episode.status === "scheduled") {
        router.push("/schedule");
      }
      setJustFinished(true);
    },
    onError: (msg) => {
      toast({
        title: "Falha",
        description: msg,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (phase !== "finished" && justFinished) {
      setJustFinished(false);
    }
  }, [phase, justFinished]);

  const isFinished = phase === "finished";
  const isError = phase === "error";

  /* --------------------------------------------------
   * Handlers
   * -------------------------------------------------- */
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
      toast({
        title: "Formato inválido",
        description: `Use: ${allowed.join(", ")}`,
        variant: "destructive",
      });
      return;
    }
    setDocumentFile(file);
  };

  function dismissError() {
    if (!isBusy || phase === "error") {
      resetAll();
      setJustFinished(false);
    }
  }

  const handleConfirmSchedule = () => {
    if (!scheduleDate) {
      toast({
        title: "Data inválida",
        description: "Por favor, selecione uma data para agendar.",
        variant: "destructive",
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
        toast({
          title: "Erro ao criar tag",
          description: res.error,
          variant: "destructive",
        });
        return;
      }

      createAndSelectTag({
        id: res.tag.id,
        name: res.tag.name,
        created_at: res.tag.created_at,
      });
    })().catch((e) => {
      toast({
        title: "Erro inesperado",
        description: e?.message || "Falha ao criar tag.",
        variant: "destructive",
      });
    });
  };

  return (
    <div className="h-full flex flex-col">
      {justFinished && phase === "finished" && (
        <div
          className="mb-4 flex items-center justify-between rounded-lg border border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 p-4 text-sm text-green-700 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300"
          role="status"
          aria-live="polite"
        >
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle className="h-5 w-5 text-green-600" />
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
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              Novo upload
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setJustFinished(false)}
              className="bg-green-600 hover:bg-green-700"
            >
              Fechar
            </Button>
          </div>
        </div>
      )}

      <form
        className="flex-1 flex flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          if (!isBusy) void submit("published");
        }}
      >
        <Card className="flex-1 flex flex-col overflow-hidden shadow-md border-0">
          <CardHeader className="border-b px-6 py-4">
            <CardTitle className="flex items-center gap-2 text-xl text-foreground">
              Novo Episódio
            </CardTitle>
          </CardHeader>

          <CardContent className="overflow-y-auto p-6 space-y-6">
            {lastError && (
              <div
                role="alert"
                aria-live="polite"
                className={cn(
                  "relative rounded-lg border px-4 py-3 text-sm shadow-sm animate-in fade-in slide-in-from-top-2 duration-300",
                  lastError.severity === "warning"
                    ? "border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800"
                    : "border-red-400 bg-gradient-to-r from-red-50 to-rose-50 text-red-700"
                )}
              >
                <div className="flex items-start gap-3 pr-6">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0",
                      lastError.severity === "warning"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-red-100 text-red-600"
                    )}
                  >
                    {lastError.severity === "warning" ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium leading-none">
                      {lastError.severity === "warning" ? "Aviso" : "Erro"}
                    </p>
                    <p>{buildUserMessage(lastError)}</p>
                    {process.env.NODE_ENV === "development" &&
                      lastError.technicalMessage && (
                        <p className="mt-1 text-xs opacity-75">
                          <strong>Dev:</strong>{" "}
                          {lastError.technicalMessage.slice(0, 400)}
                        </p>
                      )}
                    {lastError.meta &&
                      process.env.NODE_ENV === "development" && (
                        <pre className="mt-2 max-h-40 overflow-auto rounded bg-black/5 p-2 text-[10px]">
                          {JSON.stringify(lastError.meta, null, 2)}
                        </pre>
                      )}
                  </div>
                  <button
                    type="button"
                    onClick={dismissError}
                    className="absolute right-2 top-2 rounded p-1 text-xs text-current hover:bg-black/10 focus:outline-none transition-colors"
                    aria-label="Fechar alerta"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-base font-medium flex items-center gap-2"
                  >
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    Título *
                  </Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Digite o título do episódio"
                    className="mt-1 h-11 transition-all focus:ring-2 focus:ring-primary/20"
                    disabled={isBusy}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Descrição
                  </Label>
                  <div className="border rounded-md overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/20">
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

                <div className="space-y-2">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Tags className="h-4 w-4 text-muted-foreground" />
                    Tags
                  </Label>
                  <TagSelector
                    allTags={tags}
                    value={selectedTagIds}
                    onChange={setSelectedTagIds}
                    onCreateTag={handleCreateTag}
                    placeholder="Selecione ou crie tags..."
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <FileAudio className="h-4 w-4 text-muted-foreground" />
                    Arquivo de Áudio *
                  </Label>
                  <div
                    className={cn(
                      "rounded-lg border-2 p-4 space-y-3 transition-all",
                      audioFile
                        ? "border-primary/30 bg-primary/5"
                        : "border-dashed border-muted-foreground/25 bg-muted/20"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full",
                            audioFile
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <Music className="h-5 w-5" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-medium">
                            {audioFile
                              ? audioFile.name
                              : "Nenhum arquivo selecionado"}
                          </p>
                          {audioFile && (
                            <p className="text-xs text-muted-foreground">
                              {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          id="audio-file"
                          disabled={isBusy}
                          onChange={handleAudioChange}
                        />
                        {!audioFile && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isBusy}
                            onClick={() =>
                              document.getElementById("audio-file")?.click()
                            }
                            className="gap-1"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            Selecionar
                          </Button>
                        )}
                      </div>
                    </div>
                    {audioFile && (
                      <>
                        {phase === "audio-uploading" && (
                          <div className="space-y-2">
                            <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300 ease-out"
                                style={{
                                  width: `${Math.min(audioProgress, 100)}%`,
                                }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Enviando áudio...</span>
                              <span>{Math.floor(audioProgress)}%</span>
                            </div>
                          </div>
                        )}
                        {readablePhaseMessage() && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1.5">
                            {phase === "audio-uploading" && (
                              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            )}
                            {readablePhaseMessage()}
                          </div>
                        )}
                        {phase === "audio-uploading" ? (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={cancelAudioUpload}
                            className="gap-1"
                          >
                            <StopCircle className="h-3.5 w-3.5" />
                            Cancelar
                          </Button>
                        ) : audioFile ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isBusy}
                            onClick={() => setAudioFile(null)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            Remover seleção
                          </Button>
                        ) : null}
                        {audioFile && audioDuration != null && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1.5">
                            <Clock className="h-3 w-3" />
                            Duração: {Math.floor(audioDuration / 60)}:
                            {String(Math.floor(audioDuration % 60)).padStart(
                              2,
                              "0"
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Mic className="h-3.5 w-3.5 text-muted-foreground" />
                      Programa
                    </Label>
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
                      <SelectTrigger className="h-10 transition-all focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder="Selecione um programa" />
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
                    <Label
                      htmlFor="episode-number"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                      Nº do Episódio
                    </Label>
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
                      placeholder="Ex: 1"
                      className="h-10 transition-all focus:ring-2 focus:ring-primary/20"
                      disabled={!form.programId || isBusy}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Categoria</Label>
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
                      <SelectTrigger className="h-10 transition-all focus:ring-2 focus:ring-primary/20">
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
                    <Label className="text-sm font-medium">Subcategoria</Label>
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
                      <SelectTrigger className="h-10 transition-all focus:ring-2 focus:ring-primary/20">
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
                  <Label className="text-base font-medium flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    Documento de Apoio
                  </Label>
                  <div
                    className={cn(
                      "rounded-lg border-2 p-4 space-y-3 transition-all",
                      documentFile
                        ? "border-primary/30 bg-primary/5"
                        : "border-dashed border-muted-foreground/25 bg-muted/20"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full",
                            documentFile
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-medium">
                            {documentFile
                              ? documentFile.name
                              : "Nenhum documento selecionado"}
                          </p>
                          {documentFile && (
                            <p className="text-xs text-muted-foreground">
                              {(documentFile.size / (1024 * 1024)).toFixed(2)}{" "}
                              MB
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          id="document-file"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={handleDocumentChange}
                          disabled={
                            isBusy &&
                            phase !== "audio-done" &&
                            phase !== "finished" &&
                            phase !== "error"
                          }
                        />
                        {!documentFile && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={
                              isBusy &&
                              phase !== "audio-done" &&
                              phase !== "finished" &&
                              phase !== "error"
                            }
                            onClick={() =>
                              document.getElementById("document-file")?.click()
                            }
                            className="gap-1"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            Selecionar
                          </Button>
                        )}
                      </div>
                    </div>
                    {documentFile && (
                      <>
                        {(phase === "document-uploading" ||
                          phase === "document-registering" ||
                          documentProgress > 0) && (
                          <div className="space-y-2">
                            <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300 ease-out"
                                style={{
                                  width: `${
                                    phase === "document-registering"
                                      ? 100
                                      : Math.min(documentProgress, 100)
                                  }%`,
                                }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>
                                {phase === "document-preparing" &&
                                  "Preparando..."}
                                {phase === "document-uploading" &&
                                  "Enviando documento..."}
                                {phase === "document-registering" &&
                                  "Registrando..."}
                                {phase === "finished" && "Concluído"}
                              </span>
                              <span>
                                {phase === "document-uploading" &&
                                  `${Math.floor(documentProgress)}%`}
                              </span>
                            </div>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">
                              Nº de Páginas
                            </label>
                            <Input
                              type="number"
                              min={0}
                              value={docPageCount}
                              onChange={(e) => setDocPageCount(e.target.value)}
                              disabled={
                                !(
                                  phase === "idle" ||
                                  phase === "audio-done" ||
                                  phase === "error"
                                )
                              }
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">
                              Nº de Referências
                            </label>
                            <Input
                              type="number"
                              min={0}
                              value={docReferenceCount}
                              onChange={(e) =>
                                setDocReferenceCount(e.target.value)
                              }
                              disabled={
                                !(
                                  phase === "idle" ||
                                  phase === "audio-done" ||
                                  phase === "error"
                                )
                              }
                              className="h-9"
                            />
                          </div>
                        </div>
                        {phase === "document-uploading" ? (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={cancelDocumentUpload}
                            className="gap-1"
                          >
                            <StopCircle className="h-3.5 w-3.5" />
                            Cancelar
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={
                              isBusy &&
                              phase !== "audio-done" &&
                              phase !== "finished" &&
                              phase !== "error"
                            }
                            onClick={() => {
                              setDocumentFile(null);
                              setDocPageCount("");
                              setDocReferenceCount("");
                            }}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            Remover seleção
                          </Button>
                        )}
                        {phase === "audio-done" && documentFile && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1.5">
                            <AlertCircle className="h-3 w-3" />O documento será
                            enviado após o episódio ser criado.
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t px-6 py-4">
            <div className="w-full md:w-auto ml-auto flex flex-col md:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => submit("draft")}
                disabled={isBusy || !audioFile || !form.title.trim()}
                className="gap-1.5 h-10 px-4"
              >
                Criar Rascunho
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsScheduleDialogOpen(true)}
                disabled={isBusy || !audioFile || !form.title.trim()}
                className="gap-1.5 h-10 px-4"
              >
                <CalendarIcon className="h-4 w-4" />
                Agendar
              </Button>
              <Button
                type="button"
                onClick={() => submit("published")}
                disabled={isBusy || !audioFile || !form.title.trim()}
                className={cn(
                  "gap-1.5 h-10 px-4",
                  isFinished && "bg-green-600 hover:bg-green-700"
                )}
              >
                {phase === "idle" && (
                  <>
                    <Upload className="h-4 w-4" />
                    Publicar Agora
                  </>
                )}
                {isFinished && (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Publicado!
                  </>
                )}
                {phase !== "idle" && !isFinished && !isError && (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Processando...
                  </>
                )}
                {isError && (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    Tentar novamente
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>

      {/* DIÁLOGO DE AGENDAMENTO */}
      <Dialog
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <CalendarIcon className="h-5 w-5" />
              Agendar Publicação
            </DialogTitle>
            <DialogDescription className="text-sm">
              Selecione a data em que este episódio deve ser publicado.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <Calendar
              mode="single"
              selected={scheduleDate}
              onSelect={setScheduleDate}
              className="rounded-md border shadow-sm"
              disabled={(date) =>
                date < new Date(new Date().setDate(new Date().getDate() - 1))
              }
            />
          </div>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setIsScheduleDialogOpen(false)}
              className="gap-1.5"
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirmSchedule} className="gap-1.5">
              <CalendarIcon className="h-4 w-4" />
              Confirmar Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
