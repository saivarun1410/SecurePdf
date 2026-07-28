import { describe, expect, it } from "vitest";
import type {
  PdfDocumentItem,
  PdfPage,
  PdfSource,
} from "../app/features/documents/types/documentTypes";
import {
  movePage,
  movePageToDocumentEnd,
  removePage,
  reorderDocuments,
} from "../app/features/workspace/services/workspaceOperations";

function source(id: string): PdfSource {
  return { id, fileName: `${id}.pdf`, bytes: new Uint8Array([1, 2, 3]) };
}

function page(id: string, pdfSource: PdfSource, index: number): PdfPage {
  return {
    id,
    source: pdfSource,
    sourcePageIndex: index,
    width: 200,
    height: 300,
    thumbnailUrl: `blob:${id}`,
  };
}

function documents(): PdfDocumentItem[] {
  const firstSource = source("first");
  const secondSource = source("second");
  return [
    {
      id: "document-one",
      name: "One",
      pages: [page("one-a", firstSource, 0), page("one-b", firstSource, 1)],
    },
    {
      id: "document-two",
      name: "Two",
      pages: [page("two-a", secondSource, 0)],
    },
  ];
}

describe("workspace ordering", () => {
  it("moves pages across documents without losing their immutable source", () => {
    const moved = movePage(documents(), "one-b", "two-a");
    expect(moved[0].pages.map(({ id }) => id)).toEqual(["one-a"]);
    expect(moved[1].pages.map(({ id }) => id)).toEqual(["one-b", "two-a"]);
    expect(moved[1].pages[0].source.id).toBe("first");
  });

  it("reorders whole documents deterministically", () => {
    const reordered = reorderDocuments(
      documents(),
      "document-two",
      "document-one",
    );
    expect(reordered.map(({ id }) => id)).toEqual([
      "document-two",
      "document-one",
    ]);
  });

  it("moves a page to the end of another document", () => {
    const moved = movePageToDocumentEnd(
      documents(),
      "one-a",
      "document-two",
    );
    expect(moved[0].pages.map(({ id }) => id)).toEqual(["one-b"]);
    expect(moved[1].pages.map(({ id }) => id)).toEqual(["two-a", "one-a"]);
    expect(moved[1].pages[1].source.id).toBe("first");
  });

  it("removes empty documents after the final page is removed", () => {
    const remaining = removePage(documents(), "two-a");
    expect(remaining.map(({ id }) => id)).toEqual(["document-one"]);
  });
});
