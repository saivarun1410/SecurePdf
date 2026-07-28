import { DOMMatrix, ImageData, Path2D } from "@napi-rs/canvas";
import { unzipSync } from "fflate";
import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import type {
  PdfDocumentItem,
  PdfPage,
  PdfSource,
} from "../app/features/documents/types/documentTypes";

Object.assign(globalThis, { DOMMatrix, ImageData, Path2D });

async function createDocument(
  id: string,
  name: string,
  pageCount: number,
): Promise<PdfDocumentItem> {
  const sourceDocument = await PDFDocument.create();
  const sizes = Array.from({ length: pageCount }, (_, index) => [
    240 + index,
    320 + index,
  ] as [number, number]);
  sizes.forEach((size) => sourceDocument.addPage(size));
  const source: PdfSource = {
    id,
    fileName: `${id}.pdf`,
    bytes: await sourceDocument.save(),
  };
  const pages: PdfPage[] = sizes.map(([width, height], sourcePageIndex) => ({
    id: `${id}-${sourcePageIndex}`,
    source,
    sourcePageIndex,
    width,
    height,
    thumbnailUrl: "blob:test",
  }));
  return { id, name, pages };
}

describe("separate PDF archive export", () => {
  it("packages one independently reopenable PDF per document", async () => {
    const { createVerifiedPdfArchive } = await import(
      "../app/features/export/services/pdfArchiveService"
    );
    const documents = [
      await createDocument("first", "First / Row", 2),
      await createDocument("second", "Second Row", 1),
    ];
    const archive = await createVerifiedPdfArchive(documents, () => undefined);
    const entries = unzipSync(archive.bytes);
    const names = Object.keys(entries).sort();

    expect(archive.documentCount).toBe(2);
    expect(archive.pageCount).toBe(3);
    expect(names[0]).toMatch(/^01-First Row-[a-f0-9]{16}\.pdf$/);
    expect(names[1]).toMatch(/^02-Second Row-[a-f0-9]{16}\.pdf$/);

    const reopened = await Promise.all(
      names.map((name) => PDFDocument.load(entries[name])),
    );
    expect(reopened.map((document) => document.getPageCount())).toEqual([2, 1]);
    expect(reopened.map((document) => document.getTitle())).toEqual([
      "First Row",
      "Second Row",
    ]);
  });
});
