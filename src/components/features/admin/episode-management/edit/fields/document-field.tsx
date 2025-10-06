"use client";

import { useRef, useState } from "react";
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
import { FileText, Trash2, Upload } from "lucide-react";
import { EpisodeDocument } from "@/src/lib/types";

interface DocumentFieldProps {
  document: EpisodeDocument | null;
  onUpload: (file: File) => Promise<boolean>;
  onDelete: (doc: EpisodeDocument) => Promise<boolean>;
  disabled?: boolean;
  className?: string;
}

export function DocumentField({
  document,
  onUpload,
  onDelete,
  disabled = false,
  className,
}: DocumentFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const resetPending = () => {
    setPendingFile(null);
    setUploading(false);
  };

  const handleUpload = async () => {
    if (!pendingFile) return;
    setUploading(true);
    const ok = await onUpload(pendingFile);
    setUploading(false);
    if (ok) {
      resetPending();
    }
  };

  const handleDelete = async () => {
    if (!document) return;
    setDeleting(true);
    const ok = await onDelete(document);
    setDeleting(false);
    if (ok) {
      resetPending();
    }
  };

  return (
    <div className={className}>
      <label className="text-sm font-medium">Documento</label>

      {document ? (
        <div className="mt-2 flex items-center justify-between rounded-md border p-3">
          <div className="flex min-w-0 items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <a
              href={document.public_url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-sm hover:underline"
              title={document.file_name}
            >
              {document.file_name}
            </a>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Excluir documento"
                className="h-8 w-8 text-red-500 hover:text-red-600"
                disabled={disabled || deleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remover documento?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação removerá o arquivo permanentemente.
                  {document.file_size != null && (
                    <>
                      <br />
                      <span className="text-xs text-muted-foreground">
                        Tamanho: {(document.file_size / 1024).toFixed(1)} KB
                      </span>
                    </>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={deleting}
                  onClick={(e) => {
                    e.preventDefault();
                    void handleDelete();
                  }}
                >
                  {deleting ? "Removendo..." : "Excluir"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : (
        <div className="mt-2 flex items-center justify-between rounded-md border p-3">
          <div className="flex min-w-0 items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <span
              className="truncate text-sm"
              title={pendingFile ? pendingFile.name : "Nenhum documento"}
            >
              {pendingFile ? pendingFile.name : "Nenhum documento"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              disabled={disabled || uploading}
              onChange={(e) => setPendingFile(e.target.files?.[0] || null)}
            />

            {!pendingFile && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Anexar
              </Button>
            )}

            {pendingFile && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    disabled={disabled || uploading}
                    aria-label="Enviar documento"
                  >
                    {uploading ? "Enviando..." : "Enviar"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar upload?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Enviar <strong>{pendingFile.name}</strong> como documento
                      do episódio.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      disabled={uploading}
                      onClick={() => {
                        if (!uploading) setPendingFile(null);
                      }}
                    >
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      disabled={uploading}
                      onClick={(e) => {
                        e.preventDefault();
                        void handleUpload();
                      }}
                    >
                      {uploading ? "Processando..." : "Confirmar"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      )}

      {/* Estado: se quiser mostrar mais metadados quando existir */}
      {document && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          {document.file_size != null && (
            <span>
              {(document.file_size / 1024).toFixed(1)}
              KB
            </span>
          )}
          {document.page_count != null && (
            <span>{document.page_count} pág.</span>
          )}
          {document.reference_count != null && (
            <span>{document.reference_count} ref.</span>
          )}
          {document.created_at && (
            <span>
              criado em{" "}
              {new Date(document.created_at).toLocaleDateString("pt-BR")}
            </span>
          )}
        </div>
      )}

      {pendingFile && !document && (
        <p className="mt-1 text-[11px] text-muted-foreground">
          Arquivo pendente de confirmação.
        </p>
      )}
    </div>
  );
}
