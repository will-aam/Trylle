/**
 * Extração de número de páginas de um PDF com fallback heurístico.
 * - Import dinâmico de 'pdfjs-dist' (mantém SSR seguro).
 * - Fallback por regex se pdfjs falhar.
 */
export async function extractPdfPageCount(file: File): Promise<number | null> {
  try {
    if (typeof window === "undefined") return null;
    if (!file || !file.type.toLowerCase().includes("pdf")) return null;

    const buffer = await file.arrayBuffer();

    // Heurística rápida
    const text = bufferToAsciiSlice(buffer, 0, 2_000_000);
    const heuristic = heuristicPageCount(text);
    let fallback = heuristic > 0 ? heuristic : null;

    try {
      // Import dinâmico (typed)
      const pdfjs = await import("pdfjs-dist");
      // Em versões recentes o worker pode ser auto-configurado.
      // Se aparecer warning, você pode configurar workerSrc manualmente.

      const loadingTask = pdfjs.getDocument({ data: buffer });
      const pdf = await loadingTask.promise;
      if (pdf && typeof pdf.numPages === "number") {
        return pdf.numPages;
      }
    } catch (e) {
      console.warn("[pdf] Falha ao carregar pdfjs-dist dinamicamente:", e);
    }

    return fallback;
  } catch (err) {
    console.warn("Falha ao extrair páginas do PDF:", err);
    return null;
  }
}

function heuristicPageCount(chunk: string): number {
  const matches = chunk.match(/\/Type\s*\/Page\b/g);
  return matches ? matches.length : 0;
}

function bufferToAsciiSlice(
  buffer: ArrayBuffer,
  start: number,
  end: number
): string {
  const bytes = new Uint8Array(
    buffer.slice(start, Math.min(buffer.byteLength, end))
  );
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    const code = bytes[i];
    if (
      code === 9 ||
      code === 10 ||
      code === 13 ||
      (code >= 32 && code <= 126)
    ) {
      out += String.fromCharCode(code);
    }
  }
  return out;
}
