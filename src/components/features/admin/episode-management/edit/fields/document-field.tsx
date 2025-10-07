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
import {
  FileText,
  Trash2,
  Upload,
  Edit3,
  Check,
  X,
  StopCircle,
} from "lucide-react";
import { EpisodeDocument } from "@/src/lib/types";
import {
  deleteDocumentAction,
  updateDocumentMetadataAction,
  getDocumentSignedUploadUrl,
  registerUploadedDocumentAction,
} from "@/src/app/admin/episodes/documentActions";
import { useToast } from "@/src/hooks/use-toast";

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

type UploadPhase =
  | "idle"
  | "preparing"
  | "uploading"
  | "registering"
  | "done"
  | "error";

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

  // Novo upload
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<string>("");
  const [referenceCount, setReferenceCount] = useState<string>("");

  // Edit meta
  const [editingMeta, setEditingMeta] = useState(false);
  const [editPageCount, setEditPageCount] = useState<string>("");
  const [editReferenceCount, setEditReferenceCount] = useState<string>("");

  // Upload real
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [progress, setProgress] = useState<number>(0);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  // Delete / Save meta states
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

  // Auto page count (PDF) via import dinâmico
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
            description: `Detectado automaticamente: ${count} páginas.`,
          });
        }
      } catch {
        /* silencioso */
      }
    })();
  }, [pendingFile, pageCount, toast]);

  const readableSizeMB = (bytes: number | null | undefined) =>
    bytes != null ? (bytes / (1024 * 1024)).toFixed(2) + " MB" : "";

  const resetPending = () => {
    setPendingFile(null);
    setPageCount("");
    setReferenceCount("");
    setPhase("idle");
    setProgress(0);
    xhrRef.current?.abort();
    xhrRef.current = null;
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (f.size > 25 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "Máximo permitido: 25MB.",
        variant: "destructive",
      });
      return;
    }
    setPendingFile(f);
    setPhase("idle");
    setProgress(0);
  };

  /* ============= Fluxo: upload com progresso real ============= */
  const performUpload = async () => {
    if (!pendingFile) return;
    setPhase("preparing");
    setProgress(0);

    // 1. Gera signed URL
    const signed = await getDocumentSignedUploadUrl(
      episodeId,
      pendingFile.name
    );
    if (!signed.success || !signed.signedUrl || !signed.storagePath) {
      setPhase("error");
      toast({
        title: "Falha ao preparar upload",
        description: signed.error || "Erro desconhecido.",
        variant: "destructive",
      });
      return;
    }

    // 2. XHR PUT com progresso
    await new Promise<void>((resolve) => {
      setPhase("uploading");
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
          description: "Não foi possível enviar o arquivo.",
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
      xhr.setRequestHeader(
        "Content-Type",
        pendingFile.type || "application/octet-stream"
      );
      xhr.send(pendingFile);
    });

    if (phase === "error") return;

    // 3. Registrar no banco
    setPhase("registering");
    const register = await registerUploadedDocumentAction({
      episodeId,
      storagePath: signed.storagePath,
      fileName: signed.sanitizedFileName || pendingFile.name,
      fileSize: pendingFile.size,
      pageCount: pageCount ? Number(pageCount) : null,
      referenceCount: referenceCount ? Number(referenceCount) : null,
    });

    if (!register.success || !register.document) {
      setPhase("error");
      toast({
        title: "Falha ao registrar",
        description: register.error || "Erro desconhecido.",
        variant: "destructive",
      });
      return;
    }

    setPhase("done");
    toast({ description: "Documento anexado." });
    onUpload(register.document as any);
    resetPending();
  };

  const cancelUpload = () => {
    if (xhrRef.current && phase === "uploading") {
      xhrRef.current.abort();
      toast({ description: "Upload cancelado." });
    } else {
      resetPending();
    }
  };

  /* ============= Delete ============= */
  const handleDelete = async () => {
    if (!document) return;
    setDeleting(true);
    try {
      const res = await deleteDocumentAction(
        document.id,
        document.storage_path
      );
      if (res.success) {
        toast({ description: "Documento removido." });
        onDelete();
      } else {
        toast({
          description: res.error || "Falha ao remover.",
          variant: "destructive",
        });
      }
    } finally {
      setDeleting(false);
    }
  };

  /* ============= Edit Meta ============= */
  const startEditMeta = () => {
    setEditPageCount(
      document?.page_count != null ? String(document.page_count) : ""
    );
    setEditReferenceCount(
      document?.reference_count != null ? String(document.reference_count) : ""
    );
    setEditingMeta(true);
  };
  const cancelEditMeta = () => {
    setEditingMeta(false);
  };
  const saveMeta = async () => {
    if (!document) return;
    setSavingMeta(true);
    try {
      const updated = await updateDocumentMetadataAction(document.id, {
        page_count: editPageCount ? Number(editPageCount) : null,
        reference_count: editReferenceCount ? Number(editReferenceCount) : null,
      });
      if (updated.success && updated.document) {
        toast({ description: "Metadados atualizados." });
        onUpload(updated.document as any);
        setEditingMeta(false);
      } else {
        toast({
          description: updated.error || "Falha ao atualizar metadados.",
          variant: "destructive",
        });
      }
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
              {/* <FileText className="h-5 w-5 text-muted-foreground" /> */}
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
                  onClick={startEditMeta}
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
                  onClick={cancelEditMeta}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={savingMeta}
                  onClick={() => void saveMeta()}
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
        <div className="mt-2 space-y-4 rounded-md border p-3">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="truncate text-sm">
                {pendingFile ? pendingFile.name : "Nenhum documento"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                disabled={
                  disabled || phase === "uploading" || phase === "registering"
                }
                onChange={onFileChange}
              />
              {!pendingFile && (
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  disabled={
                    disabled || phase === "uploading" || phase === "registering"
                  }
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
              {(phase === "uploading" ||
                phase === "registering" ||
                progress > 0) && (
                <div className="space-y-1">
                  <ProgressBar
                    value={phase === "registering" ? 100 : progress}
                  />
                  <div className="text-[11px] text-muted-foreground">
                    {phase === "preparing" && "Preparando..."}
                    {phase === "uploading" &&
                      `Enviando: ${Math.floor(progress)}%`}
                    {phase === "registering" && "Registrando documento..."}
                    {phase === "done" && "Concluído."}
                    {phase === "error" && "Erro no upload."}
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
                    disabled={
                      phase !== "idle" &&
                      phase !== "error" &&
                      phase !== "preparing"
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
                    value={referenceCount}
                    onChange={(e) => setReferenceCount(e.target.value)}
                    disabled={
                      phase !== "idle" &&
                      phase !== "error" &&
                      phase !== "preparing"
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {phase === "uploading" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={cancelUpload}
                  >
                    <StopCircle className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        disabled={
                          disabled ||
                          phase === "preparing" ||
                          phase === "registering"
                        }
                        type="button"
                      >
                        {phase === "preparing"
                          ? "Preparando..."
                          : phase === "registering"
                          ? "Registrando..."
                          : "Enviar Documento"}
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
                        <AlertDialogCancel disabled={phase === "preparing"}>
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          disabled={phase === "preparing"}
                          onClick={(e) => {
                            e.preventDefault();
                            void performUpload();
                          }}
                        >
                          {phase === "preparing" ? "..." : "Confirmar"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetPending}
                  disabled={phase === "uploading" || phase === "registering"}
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
