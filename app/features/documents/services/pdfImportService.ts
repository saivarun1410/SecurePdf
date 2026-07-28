import {
  PdfSecurityError,
  validateFileBoundary,
  validatePassivePdf,
  validateWorkspaceCapacity,
} from "./pdfSecurityPolicy";
import { openPdfForInspection } from "./pdfRuntime";
import type {
  PdfDocumentItem,
  PdfPage,
  PdfSource,
} from "../types/documentTypes";

const THUMBNAIL_WIDTH = 180;

function createIdentifier(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function stripPdfExtension(fileName: string): string {
  return fileName.replace(/\.pdf$/i, "") || "Untitled";
}

async function renderThumbnail(
  pdf: Awaited<ReturnType<typeof openPdfForInspection>>,
  pageNumber: number,
): Promise<{ url: string; width: number; height: number }> {
  const page = await pdf.getPage(pageNumber);
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = THUMBNAIL_WIDTH / baseViewport.width;
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) {
    throw new PdfSecurityError("RENDER_FAILED", "A page preview could not be rendered.");
  }
  await page.render({ canvas, canvasContext: context, viewport }).promise;
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.82),
  );
  if (!blob) {
    throw new PdfSecurityError("RENDER_FAILED", "A page preview could not be created.");
  }
  return {
    url: URL.createObjectURL(blob),
    width: baseViewport.width,
    height: baseViewport.height,
  };
}

async function createPages(
  source: PdfSource,
  pdf: Awaited<ReturnType<typeof openPdfForInspection>>,
): Promise<PdfPage[]> {
  const pages: PdfPage[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const thumbnail = await renderThumbnail(pdf, pageNumber);
    pages.push({
      id: createIdentifier("page"),
      source,
      sourcePageIndex: pageNumber - 1,
      width: thumbnail.width,
      height: thumbnail.height,
      thumbnailUrl: thumbnail.url,
    });
  }
  return pages;
}

export async function importPdfFile(
  file: File,
  currentBytes: number,
  currentPages: number,
): Promise<PdfDocumentItem> {
  validateFileBoundary(file);
  const bytes = new Uint8Array(await file.arrayBuffer());
  validatePassivePdf(bytes);
  const { PDFDocument } = await import("pdf-lib");
  await PDFDocument.load(bytes, {
    ignoreEncryption: false,
    throwOnInvalidObject: true,
    updateMetadata: false,
  });
  const inspectionPdf = await openPdfForInspection(bytes);
  validateWorkspaceCapacity(
    currentBytes,
    currentPages,
    bytes.byteLength,
    inspectionPdf.numPages,
  );
  const sourceId = createIdentifier("source");
  const source = { id: sourceId, fileName: file.name, bytes };
  try {
    const pages = await createPages(source, inspectionPdf);
    return {
      id: createIdentifier("document"),
      name: stripPdfExtension(file.name),
      pages,
    };
  } finally {
    await inspectionPdf.destroy();
  }
}
