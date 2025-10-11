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
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false); // <- NOVO ESTADO
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(
    new Date()
  ); // <- NOVO ESTADO

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
      router.refresh(); // Atualiza a lista de episódios
      if (episode.status === "scheduled") {
        router.push("/schedule"); // Redireciona para a página de programação
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
    // Seta a data no formulário e submete com o status 'scheduled'
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
          className="mb-4 flex items-center justify-between rounded-md border border-green-300 bg-green-50 p-4 text-sm text-green-700"
          role="status"
          aria-live="polite"
        >
          <span className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
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

      <form
        className="flex-1 flex flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          if (!isBusy) void submit("published");
        }}
      >
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" /> Novo Episódio
            </CardTitle>
          </CardHeader>

          <CardContent className="overflow-y-auto p-6 space-y-6">
            {lastError && (
              <div
                role="alert"
                aria-live="polite"
                className={cn(
                  "relative rounded-md border px-4 py-3 text-sm shadow-sm",
                  lastError.severity === "warning"
                    ? "border-amber-300 bg-amber-50 text-amber-800"
                    : "border-red-400 bg-red-50 text-red-700"
                )}
              >
                <div className="flex items-start gap-3 pr-6">
                  <XCircle
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      lastError.severity === "warning"
                        ? "text-amber-500"
                        : "text-red-500"
                    )}
                  />
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
                    className="absolute right-2 top-2 rounded p-1 text-xs text-current hover:bg-black/10 focus:outline-none"
                    aria-label="Fechar alerta"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Digite o título do episódio"
                    className="mt-1"
                    disabled={isBusy}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <RichTextEditor
                    content={form.description}
                    onChange={(newContent) =>
                      setForm((prev) => ({ ...prev, description: newContent }))
                    }
                  />
                </div>
                <div>
                  <Label>Tags</Label>
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
                <div className="space-y-2">
                  <Label>Arquivo de Áudio *</Label>
                  <div className="rounded-md border p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <Music className="h-5 w-5 text-muted-foreground" />
                        <div className="truncate text-sm">
                          {audioFile
                            ? audioFile.name
                            : "Nenhum arquivo selecionado"}
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
                          >
                            Selecionar
                          </Button>
                        )}
                      </div>
                    </div>
                    {audioFile && (
                      <>
                        {phase === "audio-uploading" && (
                          <div>
                            <div className="w-full h-2 rounded bg-muted overflow-hidden mb-1">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{
                                  width: `${Math.min(audioProgress, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                        {readablePhaseMessage() && (
                          <div className="text-[11px] text-muted-foreground">
                            {readablePhaseMessage()}
                          </div>
                        )}
                        {phase === "audio-uploading" ? (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={cancelAudioUpload}
                          >
                            <StopCircle className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                        ) : audioFile ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isBusy}
                            onClick={() => setAudioFile(null)}
                          >
                            Remover seleção
                          </Button>
                        ) : null}
                        {audioFile && audioDuration != null && (
                          <p className="text-xs text-muted-foreground">
                            Duração: {Math.floor(audioDuration / 60)}:
                            {String(Math.floor(audioDuration % 60)).padStart(
                              2,
                              "0"
                            )}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Programa</Label>
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
                      <SelectTrigger className="mt-1">
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
                  <div>
                    <Label htmlFor="episode-number">Nº do Episódio</Label>
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
                      className="mt-1"
                      disabled={!form.programId || isBusy}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Categoria</Label>
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
                      <SelectTrigger className="mt-1">
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
                  <div>
                    <Label>Subcategoria</Label>
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
                      <SelectTrigger className="mt-1">
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
                <div className="space-y-2">
                  <Label htmlFor="document-file">Documento de Apoio</Label>
                  <div className="rounded-md border p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div className="truncate text-sm">
                          {documentFile
                            ? documentFile.name
                            : "Nenhum documento selecionado"}
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
                          >
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
                          <div>
                            <div className="w-full h-2 rounded bg-muted overflow-hidden mb-1">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{
                                  width: `${
                                    phase === "document-registering"
                                      ? 100
                                      : Math.min(documentProgress, 100)
                                  }%`,
                                }}
                              />
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {phase === "document-preparing" &&
                                "Preparando..."}
                              {phase === "document-uploading" &&
                                `Enviando doc: ${Math.floor(
                                  documentProgress
                                )}%`}
                              {phase === "document-registering" &&
                                "Registrando..."}
                              {phase === "finished" && "Concluído"}
                            </div>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col">
                            <label className="text-xs font-medium">
                              Nº de Páginas (opcional)
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
                            />
                          </div>
                          <div className="flex flex-col">
                            <label className="text-xs font-medium">
                              Nº de Referências (opcional)
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
                            />
                          </div>
                        </div>
                        {phase === "document-uploading" ? (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={cancelDocumentUpload}
                          >
                            <StopCircle className="h-4 w-4 mr-1" />
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
                          >
                            Remover seleção
                          </Button>
                        )}
                        {phase === "audio-done" && documentFile && (
                          <p className="text-[11px] text-muted-foreground">
                            O documento será enviado após o episódio ser criado.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* O CAMPO DE DATA FOI REMOVIDO DAQUI */}
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t pt-6">
            <div className="w-full md:w-auto ml-auto flex flex-col md:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => submit("draft")}
                disabled={isBusy || !audioFile || !form.title.trim()}
              >
                Salvar como Rascunho
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsScheduleDialogOpen(true)} // <- AÇÃO ALTERADA
                disabled={isBusy || !audioFile || !form.title.trim()}
              >
                Agendar...
              </Button>
              <Button
                type="button"
                onClick={() => submit("published")}
                disabled={isBusy || !audioFile || !form.title.trim()}
                className={cn(isFinished && "bg-green-600 hover:bg-green-700")}
              >
                {phase === "idle" && "Publicar Agora"}
                {isFinished && (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" /> Publicado!
                  </>
                )}
                {phase !== "idle" &&
                  !isFinished &&
                  !isError &&
                  "Processando..."}
                {isError && "Tentar novamente"}
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
          <DialogHeader>
            <DialogTitle>Agendar Publicação</DialogTitle>
            <DialogDescription>
              Selecione a data em que este episódio deve ser publicado.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <Calendar
              mode="single"
              selected={scheduleDate}
              onSelect={setScheduleDate}
              className="rounded-md border"
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
            <Button onClick={handleConfirmSchedule}>
              Confirmar Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
