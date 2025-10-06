"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/src/components/ui/alert-dialog";
import { FileAudio, RefreshCw } from "lucide-react";

interface AudioFieldProps {
  currentFileName: string | null;
  onUploadReplace: (file: File) => Promise<boolean>;
  disabled?: boolean;
}

export function AudioField({
  currentFileName,
  onUploadReplace,
  disabled = false,
}: AudioFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  // Carregar duração para pré-visualização (metadados)
  useEffect(() => {
    if (!file) {
      setDuration(null);
      return;
    }
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const handleConfirm = async () => {
    if (!file) return;
    setUploading(true);
    const ok = await onUploadReplace(file);
    setUploading(false);
    if (ok) {
      setFile(null);
      setDuration(null);
    }
  };

  const readableDuration =
    duration != null ? `${Math.round(duration)}s` : undefined;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Áudio</label>
      <div className="flex items-center justify-between p-3 border rounded-md">
        <div className="flex items-center gap-2 overflow-hidden">
          <FileAudio className="h-5 w-5 text-muted-foreground" />
          <div className="truncate text-xs">
            {file ? file.name : currentFileName || "Sem arquivo"}
            {readableDuration && (
              <span className="ml-2 text-muted-foreground">
                ({readableDuration})
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={disabled}
          />
          {!file && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
            >
              Trocar
            </Button>
          )}
          {file && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  disabled={disabled || uploading}
                  aria-label="Confirmar substituição de áudio"
                >
                  {uploading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    "Enviar"
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Substituir áudio?</AlertDialogTitle>
                  <AlertDialogDescription>
                    O arquivo atual será substituído por{" "}
                    <strong>{file.name}</strong>. Deseja continuar?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => !uploading && setFile(null)}
                    disabled={uploading}
                  >
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      if (!uploading) void handleConfirm();
                    }}
                    disabled={uploading}
                  >
                    {uploading ? "Processando..." : "Confirmar"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
}
