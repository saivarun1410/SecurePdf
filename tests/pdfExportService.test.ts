import { DOMMatrix, ImageData, Path2D } from "@napi-rs/canvas";
import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import type {
  PdfDocumentItem,
  PdfPage,
  PdfSource,
} from "../app/features/documents/types/documentTypes";

Object.assign(globalThis, { DOMMatrix, ImageData, Path2D });

async function createSource(
  id: string,
  sizes: Array<[number, number]>,
): Promise<PdfSource> {
  const document = await PDFDocument.create();
  sizes.forEach(([width, height]) => document.addPage([width, height]));
  return {
    id,
    fileName: `${id}.pdf`,
    bytes: await document.save(),
  };
}

function page(source: PdfSource, sourcePageIndex: number): PdfPage {
  const sizes: Array<[number, number]> = [
    [200, 300],
    [400, 250],
  ];
  const [width, height] = sizes[sourcePageIndex];
  return {
    id: `${source.id}-${sourcePageIndex}`,
    source,
    sourcePageIndex,
    width,
    height,
    thumbnailUrl: "blob:test",
  };
}

describe("verified PDF export", () => {
  it("builds in canonical order and passes independent page verification", async () => {
    const { createVerifiedPdf } = await import(
      "../app/features/export/services/pdfExportService"
    );
    const source = await createSource("source", [
      [200, 300],
      [400, 250],
    ]);
    const documents: PdfDocumentItem[] = [
      { id: "document", name: "Verified", pages: [page(source, 1), page(source, 0)] },
    ];
    const exported = await createVerifiedPdf(documents, () => undefined);
    expect(exported.pageCount).toBe(2);
    expect(exported.fingerprint).toMatch(/^[a-f0-9]{16}$/);
    const reopened = await PDFDocument.load(exported.bytes);
    expect(reopened.getPage(0).getSize()).toEqual({ width: 400, height: 250 });
    expect(reopened.getPage(1).getSize()).toEqual({ width: 200, height: 300 });
  });
});
