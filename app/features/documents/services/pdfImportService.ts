import {
  PdfSecurityError,
  validateDocumentFormSafety,
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

const PREVIEW_PIXEL_WIDTH = 900;

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
  const scale = PREVIEW_PIXEL_WIDTH / baseViewport.width;
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
    canvas.toBlob(resolve, "image/png"),
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
  try {
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
  } catch (error) {
    pages.forEach((page) => URL.revokeObjectURL(page.thumbnailUrl));
    if (error instanceof PdfSecurityError) throw error;
    throw new PdfSecurityError(
      "PREVIEW_FAILED",
      "A sharp preview could not be rendered safely. The PDF was left untouched.",
    );
  }
}

async function parsePdfDocument(bytes: Uint8Array) {
  const { PDFDocument } = await import("pdf-lib");
  try {
    return await PDFDocument.load(bytes, {
      ignoreEncryption: false,
      throwOnInvalidObject: true,
      updateMetadata: false,
    });
  } catch {
    throw new PdfSecurityError(
      "MALFORMED_PDF",
      "This PDF is encrypted or malformed and could not be opened safely.",
    );
  }
}

async function inspectPdf(bytes: Uint8Array) {
  try {
    return await openPdfForInspection(bytes);
  } catch (error) {
    const developmentDetail =
      import.meta.env.DEV && error instanceof Error ? ` (${error.message})` : "";
    throw new PdfSecurityError(
      "INSPECTION_FAILED",
      `An independent PDF parser could not inspect this file safely.${developmentDetail}`,
    );
  }
}

export async function importPdfFile(
  file: File,
  currentBytes: number,
  currentPages: number,
): Promise<PdfDocumentItem> {
  validateFileBoundary(file);
  const bytes = new Uint8Array(await file.arrayBuffer());
  validatePassivePdf(bytes);
  const parsedDocument = await parsePdfDocument(bytes);
  validateDocumentFormSafety(parsedDocument);
  const inspectionPdf = await inspectPdf(bytes);
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
