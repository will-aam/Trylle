"use client";

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
import { TagSelector } from "../admin/TagSelector";
import { Upload, CheckCircle, StopCircle, Music, FileText } from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";
import { cn } from "@/src/lib/utils";
import { useEpisodeUpload } from "@/src/hooks/useEpisodeUpload";

export function UploadForm() {
  const { toast } = useToast();
  const router = useRouter();

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
  } = useEpisodeUpload({
    onSuccess: (episode) => {
      toast({
        title: "Sucesso!",
        description: `Episódio "${episode.title}" criado.`,
      });
      router.refresh();
      resetAll();
    },
    onError: (msg) => {
      toast({
        title: "Erro",
        description: msg,
        variant: "destructive",
      });
    },
  });

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

  const isFinished = phase === "finished";
  const isError = phase === "error";

  return (
    <form className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" /> Novo Episódio
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coluna Esquerda */}
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
                  onCreateTag={createAndSelectTag}
                  placeholder="Selecione ou crie tags..."
                />
              </div>
            </div>

            {/* Coluna Direita */}
            <div className="space-y-6">
              {/* Áudio */}
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
                          {String(audioDuration % 60).padStart(2, "0")}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Programa / Nº Episódio */}
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

              {/* Categoria / Subcategoria */}
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

              {/* Documento */}
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
                          phase !== "finished"
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
                            phase !== "finished"
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
                            {phase === "document-preparing" && "Preparando..."}
                            {phase === "document-uploading" &&
                              `Enviando doc: ${Math.floor(documentProgress)}%`}
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
                            isBusy && phase !== "audio-done" && !isFinished
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
                          O documento será enviado após criar o episódio.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Publicação */}
              <div>
                <Label htmlFor="published-at">Data de Publicação</Label>
                <Input
                  id="published-at"
                  type="date"
                  value={form.publishedAt}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      publishedAt: e.target.value,
                    }))
                  }
                  className="mt-1"
                  disabled={isBusy}
                />
              </div>
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
              {phase === "idle" && "Criar rascunho"}
              {phase === "finished" && (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" /> Feito
                </>
              )}
              {phase !== "idle" &&
                phase !== "finished" &&
                !isError &&
                "Processando..."}
              {isError && "Tentar novamente"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => submit("scheduled")}
              disabled={isBusy || !audioFile || !form.title.trim()}
            >
              {phase === "idle" && "Agendar"}
              {phase === "finished" && (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" /> Sucesso
                </>
              )}
              {phase !== "idle" &&
                phase !== "finished" &&
                !isError &&
                "Processando..."}
              {isError && "Retry"}
            </Button>
            <Button
              type="button"
              onClick={() => submit("published")}
              disabled={isBusy || !audioFile || !form.title.trim()}
              className={cn({
                "bg-green-600 hover:bg-green-700": isFinished,
              })}
            >
              {phase === "idle" && "Publicar"}
              {phase === "finished" && (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" /> Publicado
                </>
              )}
              {phase !== "idle" &&
                phase !== "finished" &&
                !isError &&
                "Processando..."}
              {isError && "Tentar novamente"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
