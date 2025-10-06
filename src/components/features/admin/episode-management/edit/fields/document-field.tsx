"use client";

import { useRef, useState, useEffect } from "react";
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

/* Barra de progresso simples */
function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-2 rounded bg-muted overflow-hidden">
      <div
        className="h-full bg-primary transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

interface DocumentFieldProps {
  episodeId: string;
  document: EpisodeDocument | null;
  onUpload: (doc: EpisodeDocument) => void;
  onDelete: () => void;
  disabled?: boolean;
  className?: string;
}

export function DocumentField({
  episodeId,
  document,
  onUpload,
  onDelete,
  disabled = false,
  className,
}: DocumentFieldProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  // Upload (novo doc)
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<string>("");
  const [referenceCount, setReferenceCount] = useState<string>("");

  // Edição meta
  const [editingMeta, setEditingMeta] = useState(false);
  const [editPageCount, setEditPageCount] = useState<string>("");
  const [editReferenceCount, setEditReferenceCount] = useState<string>("");

  // Estados operacionais
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [deleting, setDeleting] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);

  useEffect(() => {
    if (document) {
      setEditPageCount(
        document.page_count != null ? String(document.page_count) : ""
      );
      setEditReferenceCount(
        document.reference_count != null ? String(document.reference_count) : ""
      );
    } else {
      setEditPageCount("");
      setEditReferenceCount("");
    }
  }, [document]);

  const readableSizeMB = (bytes: number | null | undefined) =>
    bytes != null ? (bytes / (1024 * 1024)).toFixed(2) + " MB" : "";

  const resetPending = () => {
    setPendingFile(null);
    setPageCount("");
    setReferenceCount("");
    setUploadProgress(0);
    setUploading(false);
  };

  /* Auto extração de páginas (dinâmica) */
  useEffect(() => {
    (async () => {
      if (!pendingFile) return;
      if (!pendingFile.type.toLowerCase().includes("pdf")) return;
      if (pageCount.trim() !== "") return;
      try {
        const { extractPdfPageCount } = await import(
          "@/src/lib/pdf/extract-pdf-page-count"
        );
        const count = await extractPdfPageCount(pendingFile);
        if (count && !isNaN(count)) {
          setPageCount(String(count));
          toast({
            description: `Nº de páginas detectado automaticamente: ${count}`,
          });
        }
      } catch (err) {
        console.warn("Falha extração automática (pdf):", err);
      }
    })();
  }, [pendingFile, pageCount, toast]);

  /* Simulação de progresso (2 fases) */
  const simulateUploadPhases = () => {
    let current = 60;
    const interval = setInterval(() => {
      current += Math.random() * 10;
      if (current >= 95 || !uploading) {
        clearInterval(interval);
        if (uploading) setUploadProgress(95);
      } else {
        setUploadProgress(current);
      }
    }, 300);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (!f) {
      resetPending();
      return;
    }
    const allowed = [".pdf", ".doc", ".docx"];
    const lower = f.name.toLowerCase();
    if (!allowed.some((ext) => lower.endsWith(ext))) {
      toast({
        title: "Formato inválido",
        description: `Use: ${allowed.join(", ")}`,
        variant: "destructive",
      });
      return;
    }
    setPendingFile(f);
    setPageCount("");
    setReferenceCount("");
    setUploadProgress(0);

    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = (event.loaded / event.total) * 60;
        setUploadProgress(percent);
      }
    };
    reader.onloadend = () => {
      setUploadProgress((prev) => (prev < 60 ? 60 : prev));
    };
    reader.readAsArrayBuffer(f);
  };

  const handleUpload = async () => {
    if (!pendingFile) return;
    setUploading(true);
    simulateUploadPhases();
    try {
      const formData = new FormData();
      formData.append("file", pendingFile);
      if (pageCount.trim()) formData.append("page_count", pageCount.trim());
      if (referenceCount.trim())
        formData.append("reference_count", referenceCount.trim());

      const result = await uploadDocumentAction(episodeId, formData);
      if (result.success) {
        setUploadProgress(100);
        toast({ description: "Documento anexado." });
        onUpload(result.document as any);
        resetPending();
      } else {
        toast({
          description: result.error || "Falha ao anexar documento.",
          variant: "destructive",
        });
        setUploadProgress(0);
      }
    } catch (e: any) {
      toast({
        description: e?.message || "Erro inesperado no upload.",
        variant: "destructive",
      });
      setUploadProgress(0);
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
        onUpload(updated.document as any);
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
                onChange={handleFileInputChange}
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
              {(uploading || uploadProgress > 0) && (
                <div className="space-y-1">
                  <ProgressBar value={uploadProgress} />
                  <div className="text-[11px] text-muted-foreground">
                    {uploadProgress < 100
                      ? `Progresso: ${Math.floor(uploadProgress)}%`
                      : "Concluído"}
                  </div>
                </div>
              )}

              <div className="text-[11px] text-muted-foreground">
                Tamanho Local: {readableSizeMB(pendingFile.size)} (
                {pendingFile.size} bytes)
              </div>

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

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    disabled={disabled || uploading}
                    type="button"
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
                    <AlertDialogCancel disabled={uploading}>
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
