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
import { FileText, Trash2, Upload, Edit3, Check, X } from "lucide-react";
import { EpisodeDocument } from "@/src/lib/types";
import {
  uploadDocumentAction,
  deleteDocumentAction,
  updateDocumentMetadataAction,
} from "@/src/app/admin/episodes/documentActions";
import { useToast } from "@/src/hooks/use-toast";

interface DocumentFieldProps {
  document: EpisodeDocument | null;
  onUpload: (doc: EpisodeDocument) => void; // agora devolve o documento completo
  onDelete: () => void;
  episodeId?: string; // para poder usar a action daqui diretamente se quiser
  disabled?: boolean;
  className?: string;
}

export function DocumentField({
  document,
  onUpload,
  onDelete,
  episodeId,
  disabled = false,
  className,
}: DocumentFieldProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  // Upload state
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<string>("");
  const [referenceCount, setReferenceCount] = useState<string>("");

  // Loading states
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingMeta, setEditingMeta] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);

  // Local meta edit (quando já existe documento)
  const [editPageCount, setEditPageCount] = useState<string>(
    document?.page_count != null ? String(document.page_count) : ""
  );
  const [editReferenceCount, setEditReferenceCount] = useState<string>(
    document?.reference_count != null ? String(document.reference_count) : ""
  );

  const readableSizeMB = (bytes: number | null | undefined) => {
    if (bytes == null) return "";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const resetPending = () => {
    setPendingFile(null);
    setPageCount("");
    setReferenceCount("");
    setUploading(false);
  };

  const handleUpload = async () => {
    if (!pendingFile || !episodeId) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", pendingFile);
      if (pageCount) formData.append("page_count", pageCount);
      if (referenceCount) formData.append("reference_count", referenceCount);

      const result = await uploadDocumentAction(episodeId, formData);
      if (result.success) {
        toast({ description: "Documento anexado." });
        onUpload(result.document as any);
        resetPending();
      } else {
        toast({
          description: result.error || "Falha ao anexar documento.",
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        description: e?.message || "Erro inesperado no upload.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!document) return;
    setDeleting(true);
    try {
      const result = await deleteDocumentAction(
        document.id,
        document.storage_path
      );
      if (result.success) {
        toast({ description: "Documento removido." });
        onDelete();
      } else {
        toast({
          description: result.error || "Falha ao remover.",
          variant: "destructive",
        });
      }
    } finally {
      setDeleting(false);
    }
  };

  const startEditMetadata = () => {
    setEditPageCount(
      document?.page_count != null ? String(document.page_count) : ""
    );
    setEditReferenceCount(
      document?.reference_count != null ? String(document.reference_count) : ""
    );
    setEditingMeta(true);
  };

  const cancelEditMetadata = () => {
    setEditingMeta(false);
    setEditPageCount(
      document?.page_count != null ? String(document.page_count) : ""
    );
    setEditReferenceCount(
      document?.reference_count != null ? String(document.reference_count) : ""
    );
  };

  const saveMetadata = async () => {
    if (!document) return;
    setSavingMeta(true);
    try {
      const updated = await updateDocumentMetadataAction(document.id, {
        page_count: editPageCount ? Number(editPageCount) : null,
        reference_count: editReferenceCount ? Number(editReferenceCount) : null,
      });
      if (updated.success) {
        toast({ description: "Metadados atualizados." });
        onUpload(updated.document as any); // reutiliza callback para "refresh"
        setEditingMeta(false);
      } else {
        toast({
          description: updated.error || "Falha ao atualizar metadados.",
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        description: e?.message || "Erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setSavingMeta(false);
    }
  };

  return (
    <div className={className}>
      <label className="text-sm font-medium">Documento de Apoio</label>

      {/* Caso JÁ exista documento */}
      {document ? (
        <div className="mt-2 space-y-3 rounded-md border p-3">
          <div className="flex items-center justify-between">
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
            <div className="flex items-center gap-2">
              {!editingMeta && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  onClick={startEditMetadata}
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Editar Meta
                </Button>
              )}
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
          </div>

          {/* Metadados / Modo edição */}
          {!editingMeta ? (
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-muted-foreground">
              {document.file_size != null && (
                <span>
                  Tamanho: {readableSizeMB(document.file_size)} (
                  {document.file_size} bytes)
                </span>
              )}
              <span>
                Páginas:{" "}
                {document.page_count != null ? document.page_count : "—"}
              </span>
              <span>
                Referências:{" "}
                {document.reference_count != null
                  ? document.reference_count
                  : "—"}
              </span>
              {document.created_at && (
                <span>
                  Enviado em{" "}
                  {new Date(document.created_at).toLocaleDateString("pt-BR")}
                </span>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3 border-t pt-3">
              <div className="flex gap-4">
                <div className="flex flex-col flex-1">
                  <label className="text-xs font-medium">
                    Nº de Páginas (opcional)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={editPageCount}
                    onChange={(e) => setEditPageCount(e.target.value)}
                    disabled={savingMeta}
                  />
                </div>
                <div className="flex flex-col flex-1">
                  <label className="text-xs font-medium">
                    Nº de Referências (opcional)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={editReferenceCount}
                    onChange={(e) => setEditReferenceCount(e.target.value)}
                    disabled={savingMeta}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={savingMeta}
                  onClick={cancelEditMetadata}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={savingMeta}
                  onClick={() => void saveMetadata()}
                >
                  {savingMeta ? (
                    "Salvando..."
                  ) : (
                    <Check className="h-4 w-4 mr-1" />
                  )}
                  {savingMeta ? "" : "Salvar"}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Caso NÃO exista documento ainda
        <div className="mt-2 space-y-3 rounded-md border p-3">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <span
                className="truncate text-sm"
                title={
                  pendingFile
                    ? pendingFile.name
                    : "Nenhum documento selecionado"
                }
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
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setPendingFile(f);
                }}
              />
              {!pendingFile && (
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  disabled={disabled || uploading}
                  onClick={() => inputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar
                </Button>
              )}
            </div>
          </div>

          {pendingFile && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-medium">
                    Nº de Páginas (opcional)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={pageCount}
                    onChange={(e) => setPageCount(e.target.value)}
                    disabled={uploading}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-medium">
                    Nº de Referências (opcional)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={referenceCount}
                    onChange={(e) => setReferenceCount(e.target.value)}
                    disabled={uploading}
                  />
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground">
                Tamanho Local: {readableSizeMB(pendingFile.size)} (
                {pendingFile.size} bytes)
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    disabled={disabled || uploading || !episodeId}
                  >
                    {uploading ? "Enviando..." : "Enviar Documento"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar upload?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Enviar <strong>{pendingFile.name}</strong>
                      {pageCount && (
                        <>
                          {" "}
                          com <strong>{pageCount}</strong> páginas
                        </>
                      )}
                      {referenceCount && (
                        <>
                          {" "}
                          e <strong>{referenceCount}</strong> referências
                        </>
                      )}
                      ?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      onClick={() => {
                        if (!uploading) {
                          // manter selecionado ou limpar?
                          // setPendingFile(null);
                        }
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

              <div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={uploading}
                  onClick={() => resetPending()}
                  className="text-xs"
                >
                  Remover seleção
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
