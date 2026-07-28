import { Zip, ZipPassThrough } from "fflate";
import type { PdfDocumentItem } from "../../documents/types/documentTypes";
import { resolveExportName } from "./exportFilenameService";
import {
  createVerifiedPdf,
  type ExportProgress,
} from "./pdfExportService";

export interface VerifiedPdfArchive {
  readonly bytes: Uint8Array;
  readonly documentCount: number;
  readonly pageCount: number;
}

interface ArchiveWriter {
  readonly add: (filename: string, bytes: Uint8Array) => void;
  readonly finish: () => Promise<Uint8Array>;
  readonly abort: () => void;
}

function concatenateChunks(chunks: Uint8Array[]): Uint8Array {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  chunks.forEach((chunk) => {
    combined.set(chunk, offset);
    offset += chunk.length;
  });
  return combined;
}

function createArchiveWriter(): ArchiveWriter {
  const chunks: Uint8Array[] = [];
  let completeArchive: (bytes: Uint8Array) => void = () => undefined;
  let rejectArchive: (error: Error) => void = () => undefined;
  const completion = new Promise<Uint8Array>((resolve, reject) => {
    completeArchive = resolve;
    rejectArchive = reject;
  });
  const archive = new Zip((error, chunk, final) => {
    if (error) {
      rejectArchive(error);
      return;
    }
    chunks.push(chunk);
    if (final) completeArchive(concatenateChunks(chunks));
  });
  return {
    add: (filename, bytes) => {
      const entry = new ZipPassThrough(filename);
      archive.add(entry);
      entry.push(bytes, true);
    },
    finish: () => {
      archive.end();
      return completion;
    },
    abort: () => archive.terminate(),
  };
}

function archiveEntryName(
  document: PdfDocumentItem,
  index: number,
  fingerprint: string,
): string {
  const rowNumber = String(index + 1).padStart(2, "0");
  const { filenameStem } = resolveExportName(document.name);
  return `${rowNumber}-${filenameStem}-${fingerprint}.pdf`;
}

export async function createVerifiedPdfArchive(
  documents: PdfDocumentItem[],
  report: ExportProgress,
): Promise<VerifiedPdfArchive> {
  if (documents.length === 0) throw new Error("Add at least one PDF first.");
  const writer = createArchiveWriter();
  let pageCount = 0;
  try {
    for (let index = 0; index < documents.length; index += 1) {
      const document = documents[index];
      const exportName = resolveExportName(document.name);
      const verified = await createVerifiedPdf(
        [document],
        (message) => report(`Document ${index + 1}: ${message}`),
        exportName.documentTitle,
      );
      writer.add(
        archiveEntryName(document, index, verified.fingerprint),
        verified.bytes,
      );
      pageCount += verified.pageCount;
    }
    report("Packaging independently verified PDFs…");
    return {
      bytes: await writer.finish(),
      documentCount: documents.length,
      pageCount,
    };
  } catch (error) {
    writer.abort();
    throw error;
  }
}

export function downloadVerifiedPdfArchive(
  archive: VerifiedPdfArchive,
  filenameStem: string,
): void {
  const blob = new Blob([archive.bytes.slice()], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${filenameStem}.zip`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
