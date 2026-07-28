import type { PdfDocumentItem } from "../../documents/types/documentTypes";

function moveArrayItem<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function renameDocument(
  documents: PdfDocumentItem[],
  documentId: string,
  name: string,
): PdfDocumentItem[] {
  const safeName = name.trim() || "Untitled";
  return documents.map((document) =>
    document.id === documentId ? { ...document, name: safeName } : document,
  );
}

export function removeDocument(
  documents: PdfDocumentItem[],
  documentId: string,
): PdfDocumentItem[] {
  return documents.filter((document) => document.id !== documentId);
}

export function removePage(
  documents: PdfDocumentItem[],
  pageId: string,
): PdfDocumentItem[] {
  return documents
    .map((document) => ({
      ...document,
      pages: document.pages.filter((page) => page.id !== pageId),
    }))
    .filter((document) => document.pages.length > 0);
}

export function reorderDocuments(
  documents: PdfDocumentItem[],
  activeId: string,
  overId: string,
): PdfDocumentItem[] {
  const activeIndex = documents.findIndex((document) => document.id === activeId);
  const overIndex = documents.findIndex((document) => document.id === overId);
  if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex) return documents;
  return moveArrayItem(documents, activeIndex, overIndex);
}

interface PageLocation {
  readonly documentIndex: number;
  readonly pageIndex: number;
}

function findPage(
  documents: PdfDocumentItem[],
  pageId: string,
): PageLocation | undefined {
  for (let documentIndex = 0; documentIndex < documents.length; documentIndex += 1) {
    const pageIndex = documents[documentIndex].pages.findIndex(
      (page) => page.id === pageId,
    );
    if (pageIndex >= 0) return { documentIndex, pageIndex };
  }
  return undefined;
}

export function movePage(
  documents: PdfDocumentItem[],
  activePageId: string,
  overPageId: string,
): PdfDocumentItem[] {
  const source = findPage(documents, activePageId);
  const target = findPage(documents, overPageId);
  if (!source || !target) return documents;
  const next = documents.map((document) => ({
    ...document,
    pages: [...document.pages],
  }));
  const [page] = next[source.documentIndex].pages.splice(source.pageIndex, 1);
  const adjustedTarget =
    source.documentIndex === target.documentIndex && source.pageIndex < target.pageIndex
      ? target.pageIndex - 1
      : target.pageIndex;
  next[target.documentIndex].pages.splice(adjustedTarget, 0, page);
  return next.filter((document) => document.pages.length > 0);
}

export function movePageToDocumentEnd(
  documents: PdfDocumentItem[],
  activePageId: string,
  targetDocumentId: string,
): PdfDocumentItem[] {
  const source = findPage(documents, activePageId);
  const targetIndex = documents.findIndex(
    (document) => document.id === targetDocumentId,
  );
  if (!source || targetIndex < 0) return documents;
  const next = documents.map((document) => ({
    ...document,
    pages: [...document.pages],
  }));
  const [page] = next[source.documentIndex].pages.splice(source.pageIndex, 1);
  next[targetIndex].pages.push(page);
  return next.filter((document) => document.pages.length > 0);
}
