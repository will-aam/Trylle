"use client";

import { useRef, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { useToast } from "@/src/hooks/use-toast";
import {
  getAudioSignedUploadUrl,
  registerUpdatedAudioAction,
} from "@/src/app/admin/episodes/audioActions";
import { Upload, Music, StopCircle } from "lucide-react";

interface AudioFieldProps {
  episodeId: string;
  currentFileName: string | null;
  currentAudioUrl?: string | null;
  disabled?: boolean;
  onReplaced?: (payload: { file_name: string; audio_url: string }) => void;
}

export function AudioField({
  episodeId,
  currentFileName,
  currentAudioUrl,
  disabled,
  onReplaced,
}: AudioFieldProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<
    "idle" | "preparing" | "uploading" | "registering" | "done" | "error"
  >("idle");
  const [progress, setProgress] = useState(0);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const choose = () => inputRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (!f) {
      reset();
      return;
    }
    if (!f.type.startsWith("audio/")) {
      toast({
        title: "Formato inválido",
        description: "Selecione um arquivo de áudio válido.",
        variant: "destructive",
      });
      return;
    }
    setPendingFile(f);
    setPhase("idle");
    setProgress(0);
  };

  const reset = () => {
    setPendingFile(null);
    setPhase("idle");
    setProgress(0);
    xhrRef.current?.abort();
    xhrRef.current = null;
  };

  const upload = async () => {
    if (!pendingFile) return;
    try {
      setPhase("preparing");
      const signed = await getAudioSignedUploadUrl(episodeId, pendingFile.name);
      if (!signed.success || !signed.signedUrl || !signed.storagePath) {
        setPhase("error");
        toast({
          title: "Falha ao preparar upload",
          description: signed.error || "Erro desconhecido.",
          variant: "destructive",
        });
        return;
      }

      setPhase("uploading");
      await new Promise<void>((resolve) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            const pct = (evt.loaded / evt.total) * 100;
            setProgress(pct);
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setProgress(100);
            resolve();
          } else {
            setPhase("error");
            toast({
              title: "Falha no upload",
              description: `Status ${xhr.status}`,
              variant: "destructive",
            });
          }
        };
        xhr.onerror = () => {
          setPhase("error");
          toast({
            title: "Erro de rede",
            description: "Não foi possível enviar o áudio.",
            variant: "destructive",
          });
        };
        xhr.onabort = () => {
          if (phase !== "error") {
            setPhase("idle");
            setProgress(0);
          }
        };
        xhr.open("PUT", signed.signedUrl!, true);
        xhr.setRequestHeader("Content-Type", pendingFile.type);
        xhr.send(pendingFile);
      });

      if (phase === "error") return;

      setPhase("registering");
      const reg = await registerUpdatedAudioAction({
        episodeId,
        storagePath: signed.storagePath,
        newFileName: signed.sanitizedFileName || pendingFile.name,
        oldFileName: currentFileName || undefined,
      });

      if (!reg.success || !reg.audio_url || !reg.file_name) {
        setPhase("error");
        toast({
          title: "Falha ao registrar",
          description: reg.error || "Erro desconhecido.",
          variant: "destructive",
        });
        return;
      }

      setPhase("done");
      toast({ description: "Áudio atualizado." });
      onReplaced?.({ file_name: reg.file_name, audio_url: reg.audio_url });
      reset();
    } catch (e: any) {
      setPhase("error");
      toast({
        title: "Erro",
        description: e?.message || "Falha inesperada.",
        variant: "destructive",
      });
    }
  };

  const cancel = () => {
    if (xhrRef.current && phase === "uploading") {
      xhrRef.current.abort();
      toast({ description: "Upload cancelado." });
    } else {
      reset();
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Áudio</label>
      <div className="rounded-md border p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="truncate text-sm">
              {pendingFile
                ? pendingFile.name
                : currentFileName || "Nenhum áudio"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={onFileChange}
              disabled={
                disabled || phase === "uploading" || phase === "registering"
              }
            />
            {!pendingFile && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={choose}
                disabled={
                  disabled || phase === "uploading" || phase === "registering"
                }
              >
                <Upload className="h-4 w-4 mr-2" />
                {currentFileName ? "Trocar" : "Selecionar"}
              </Button>
            )}
          </div>
        </div>

        {pendingFile && (
          <div className="space-y-2">
            {(phase === "uploading" ||
              phase === "registering" ||
              progress > 0) && (
              <div>
                <div className="w-full h-2 rounded bg-muted overflow-hidden mb-1">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${
                        phase === "registering" ? 100 : Math.min(progress, 100)
                      }%`,
                    }}
                  />
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {phase === "preparing" && "Preparando..."}
                  {phase === "uploading" &&
                    `Enviando: ${Math.floor(progress)}%`}
                  {phase === "registering" && "Registrando..."}
                  {phase === "done" && "Concluído."}
                  {phase === "error" && "Erro."}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {phase === "uploading" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={cancel}
                >
                  <StopCircle className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  disabled={
                    disabled || phase === "preparing" || phase === "registering"
                  }
                  onClick={() => void upload()}
                >
                  {phase === "preparing"
                    ? "Preparando..."
                    : phase === "registering"
                    ? "Registrando..."
                    : "Enviar"}
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={reset}
                disabled={phase === "uploading" || phase === "registering"}
              >
                Remover seleção
              </Button>
            </div>
          </div>
        )}

        {currentAudioUrl && !pendingFile && (
          <div className="text-[11px] text-muted-foreground truncate">
            <a
              className="underline"
              href={currentAudioUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir áudio atual
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
