// src/hooks/useProgramImageUpload.ts
"use client";

import { useState } from "react";

/**
 * Hook para gerenciar o upload de uma imagem de programa para o R2.
 * Ele obtém uma presigned URL da nossa API e faz o upload do arquivo.
 */

// Tipos para os callbacks
type OnUploadSuccess = (publicUrl: string) => void;
type OnError = (error: string) => void;

export const useProgramImageUpload = (
  onUploadSuccess: OnUploadSuccess,
  onError: OnError
) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [controller, setController] = useState<AbortController | null>(null);

  /**
   * Processa o upload do arquivo.
   */
  const uploadImageFile = async (file: File) => {
    setIsUploading(true);
    setProgress(0);

    const abortController = new AbortController();
    setController(abortController);

    try {
      // 1. Buscar a Presigned URL da nossa nova API route
      const response = await fetch(
        "/api/generate-presigned-url-program-image",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileType: file.type,
            fileSize: file.size,
          }),
          signal: abortController.signal,
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Falha ao obter URL de upload.");
      }

      const { presignedUrl, publicUrl } = await response.json();

      // 2. Fazer o Upload para o R2 (via Presigned URL) com XHR para progresso
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", presignedUrl, true);
        xhr.setRequestHeader("Content-Type", file.type);

        // Rastrear progresso
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setProgress(percentComplete);
          }
        };

        // Sucesso
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setProgress(100);
            onUploadSuccess(publicUrl); // Retorna a URL pública
            resolve();
          } else {
            reject(new Error(`Falha no upload (Status: ${xhr.status})`));
          }
        };

        // Erros
        xhr.onerror = () => {
          reject(new Error("Erro de rede durante o upload."));
        };
        xhr.onabort = () => {
          reject(new Error("Upload cancelado."));
        };

        // Lidar com cancelamento
        abortController.signal.onabort = () => {
          xhr.abort();
        };

        xhr.send(file);
      });
    } catch (error) {
      const isAbortError =
        error instanceof Error && error.name === "AbortError";
      if (isAbortError) {
        onError("Upload cancelado.");
      } else {
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        console.error("Erro no upload da imagem:", errorMessage);
        onError(errorMessage);
      }
    } finally {
      setIsUploading(false);
      setController(null);
    }
  };

  /**
   * Cancela o upload em andamento.
   */
  const cancelUpload = () => {
    if (controller) {
      controller.abort();
    }
  };

  return { isUploading, progress, uploadImageFile, cancelUpload };
};
