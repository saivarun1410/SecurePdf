import type { PDFDocument } from "pdf-lib";
import { openPdfForInspection } from "../../documents/services/pdfRuntime";
import type {
  PdfDocumentItem,
  PdfPage,
} from "../../documents/types/documentTypes";

export interface VerifiedExport {
  readonly bytes: Uint8Array;
  readonly pageCount: number;
  readonly fingerprint: string;
}

export type ExportProgress = (message: string) => void;

async function loadSources(documents: PdfDocumentItem[]) {
  const { PDFDocument } = await import("pdf-lib");
  const sources = new Map<string, PDFDocument>();
  for (const page of documents.flatMap((document) => document.pages)) {
    if (!sources.has(page.source.id)) {
      const source = await PDFDocument.load(page.source.bytes, {
        ignoreEncryption: false,
        throwOnInvalidObject: true,
        updateMetadata: false,
      });
      sources.set(page.source.id, source);
    }
  }
  return sources;
}

async function appendPage(
  output: PDFDocument,
  sources: Map<string, PDFDocument>,
  page: PdfPage,
): Promise<void> {
  const source = sources.get(page.source.id);
  if (!source) throw new Error("The original page source is unavailable.");
  const [copiedPage] = await output.copyPages(source, [page.sourcePageIndex]);
  output.addPage(copiedPage);
}

async function verifyStructure(
  bytes: Uint8Array,
  expectedPages: PdfPage[],
  report: ExportProgress,
): Promise<void> {
  const { PDFDocument } = await import("pdf-lib");
  const structural = await PDFDocument.load(bytes, {
    ignoreEncryption: false,
    throwOnInvalidObject: true,
    updateMetadata: false,
  });
  if (structural.getPageCount() !== expectedPages.length) {
    throw new Error("Verification detected an unexpected page count.");
  }
  const rendered = await openPdfForInspection(bytes);
  try {
    if (rendered.numPages !== expectedPages.length) {
      throw new Error("Independent verification detected an unexpected page count.");
    }
    for (let index = 0; index < expectedPages.length; index += 1) {
      report(`Verifying page ${index + 1} of ${expectedPages.length}…`);
      const page = await rendered.getPage(index + 1);
      await page.getOperatorList();
      const viewport = page.getViewport({ scale: 1 });
      const expected = expectedPages[index];
      const dimensionsMatch =
        Math.abs(viewport.width - expected.width) < 1 &&
        Math.abs(viewport.height - expected.height) < 1;
      if (!dimensionsMatch) {
        throw new Error(`Verification detected changed dimensions on page ${index + 1}.`);
      }
    }
  } finally {
    await rendered.destroy();
  }
}

async function fingerprint(bytes: Uint8Array): Promise<string> {
  const buffer = await crypto.subtle.digest("SHA-256", bytes.slice().buffer);
  return Array.from(new Uint8Array(buffer))
    .slice(0, 8)
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

export async function createVerifiedPdf(
  documents: PdfDocumentItem[],
  report: ExportProgress,
): Promise<VerifiedExport> {
  const expectedPages = documents.flatMap((document) => document.pages);
  if (expectedPages.length === 0) throw new Error("Add at least one PDF first.");
  const { PDFDocument } = await import("pdf-lib");
  report("Building a fresh PDF from immutable originals…");
  const output = await PDFDocument.create();
  const sources = await loadSources(documents);
  for (const page of expectedPages) await appendPage(output, sources, page);
  output.setTitle("SecurePDF verified merge");
  output.setProducer("SecurePDF");
  const bytes = await output.save({
    addDefaultPage: false,
    useObjectStreams: true,
    updateFieldAppearances: false,
  });
  report("Checking the generated document with an independent parser…");
  await verifyStructure(bytes, expectedPages, report);
  return {
    bytes,
    pageCount: expectedPages.length,
    fingerprint: await fingerprint(bytes),
  };
}

export function downloadVerifiedPdf(exported: VerifiedExport): void {
  const blob = new Blob([exported.bytes.slice()], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `securepdf-verified-${exported.fingerprint}.pdf`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
