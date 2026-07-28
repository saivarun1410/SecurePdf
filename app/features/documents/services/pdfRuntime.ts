import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
} from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

let configured = false;

function resolveWorkerUrl(): string {
  if (typeof window === "undefined" && typeof import.meta.resolve === "function") {
    return import.meta.resolve("pdfjs-dist/build/pdf.worker.min.mjs");
  }
  return pdfWorkerUrl;
}

async function configurePdfJs() {
  const pdfjs = await import("pdfjs-dist");
  if (!configured) {
    pdfjs.GlobalWorkerOptions.workerSrc = resolveWorkerUrl();
    configured = true;
  }
  return pdfjs;
}

export async function openPdfForInspection(
  bytes: Uint8Array,
): Promise<PDFDocumentProxy> {
  const pdfjs = await configurePdfJs();
  const task: PDFDocumentLoadingTask = pdfjs.getDocument({
    data: bytes.slice(),
    isEvalSupported: false,
    useSystemFonts: false,
  });
  return task.promise;
}
