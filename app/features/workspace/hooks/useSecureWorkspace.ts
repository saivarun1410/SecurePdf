"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { importPdfFile } from "../../documents/services/pdfImportService";
import { PdfSecurityError } from "../../documents/services/pdfSecurityPolicy";
import type {
  PageZoom,
  PdfDocumentItem,
  WorkspaceLayout,
} from "../../documents/types/documentTypes";
import {
  createVerifiedPdf,
  downloadVerifiedPdf,
} from "../../export/services/pdfExportService";
import { resolveExportName } from "../../export/services/exportFilenameService";
import {
  createVerifiedPdfArchive,
  downloadVerifiedPdfArchive,
} from "../../export/services/pdfArchiveService";
import type { ExportRequest } from "../../export/types/exportTypes";
import {
  recordProductEvent,
  captureCampaignSource,
} from "../../analytics/services/localAnalytics";
import {
  movePage,
  movePageToDocumentEnd,
  removeDocument,
  removePage,
  renameDocument,
  reorderDocuments,
} from "../services/workspaceOperations";
import {
  adjacentZoom,
  parseStoredLayout,
  parseStoredZoom,
} from "../services/workspacePreferences";
import type { DraggableItem, DropTarget } from "../types/dragTypes";

export interface WorkspaceNotice {
  readonly tone: "info" | "success" | "error";
  readonly message: string;
}

const LAYOUT_KEY = "realsecurepdf:layout";
const ZOOM_KEY = "realsecurepdf:page-zoom";
const HISTORY_LIMIT = 30;
const IMPORT_RETRY_GUIDANCE = "Please try again.";

function createImportErrorMessage(error: unknown): string {
  const reason =
    error instanceof PdfSecurityError
      ? error.message
      : "This PDF could not be safely opened and was rejected.";
  return `${reason} ${IMPORT_RETRY_GUIDANCE}`;
}

function workspaceByteCount(documents: PdfDocumentItem[]): number {
  const sources = new Map<string, number>();
  documents
    .flatMap((document) => document.pages)
    .forEach((page) => sources.set(page.source.id, page.source.bytes.byteLength));
  return Array.from(sources.values()).reduce((sum, bytes) => sum + bytes, 0);
}

async function createWorkspaceDownload(
  documents: PdfDocumentItem[],
  request: ExportRequest,
  report: (message: string) => void,
): Promise<WorkspaceNotice> {
  const exportName = resolveExportName(request.title);
  if (request.mode === "separate") {
    const archive = await createVerifiedPdfArchive(documents, report);
    downloadVerifiedPdfArchive(archive, exportName.filenameStem);
    return {
      tone: "success",
      message: `Verified ${archive.pageCount} pages across ${archive.documentCount} separate PDFs`,
    };
  }
  const exported = await createVerifiedPdf(
    documents,
    report,
    exportName.documentTitle,
  );
  downloadVerifiedPdf(exported, exportName.filenameStem);
  return {
    tone: "success",
    message: `Verified ${exported.pageCount} pages · fingerprint ${exported.fingerprint}`,
  };
}

export function useSecureWorkspace() {
  const [documents, setDocuments] = useState<PdfDocumentItem[]>([]);
  const [layout, setLayout] = useState<WorkspaceLayout>("rows");
  const [zoom, setZoom] = useState<PageZoom>(100);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<WorkspaceNotice | null>(null);
  const [past, setPast] = useState<PdfDocumentItem[][]>([]);
  const [future, setFuture] = useState<PdfDocumentItem[][]>([]);
  const documentsRef = useRef(documents);
  const thumbnailUrls = useRef(new Set<string>());

  useEffect(() => {
    documentsRef.current = documents;
  }, [documents]);

  useEffect(() => {
    captureCampaignSource();
    const storedLayout = localStorage.getItem(LAYOUT_KEY);
    const storedZoom = localStorage.getItem(ZOOM_KEY);
    const timer = window.setTimeout(() => {
      setLayout(parseStoredLayout(storedLayout));
      setZoom(parseStoredZoom(storedZoom));
    }, 0);
    const urls = thumbnailUrls.current;
    return () => {
      window.clearTimeout(timer);
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const totals = useMemo(
    () => ({
      bytes: workspaceByteCount(documents),
      pages: documents.reduce((sum, document) => sum + document.pages.length, 0),
    }),
    [documents],
  );

  const commit = useCallback((next: PdfDocumentItem[]) => {
    const current = documentsRef.current;
    if (next === current) return;
    setPast((history) => [...history.slice(-(HISTORY_LIMIT - 1)), current]);
    setFuture([]);
    documentsRef.current = next;
    setDocuments(next);
  }, []);

  const addFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0 || busy) return;
      setBusy(true);
      setNotice({ tone: "info", message: "Inspecting PDFs locally…" });
      let next = documentsRef.current;
      const newlyCreatedUrls: string[] = [];
      try {
        for (const file of files) {
          const bytes = workspaceByteCount(next);
          const pages = next.reduce(
            (sum, document) => sum + document.pages.length,
            0,
          );
          const imported = await importPdfFile(file, bytes, pages);
          imported.pages.forEach((page) => {
            newlyCreatedUrls.push(page.thumbnailUrl);
            thumbnailUrls.current.add(page.thumbnailUrl);
          });
          next = [...next, imported];
        }
        commit(next);
        recordProductEvent("files_added");
        setNotice({ tone: "success", message: "PDFs passed security inspection." });
      } catch (error) {
        newlyCreatedUrls.forEach((url) => {
          URL.revokeObjectURL(url);
          thumbnailUrls.current.delete(url);
        });
        setNotice({ tone: "error", message: createImportErrorMessage(error) });
      } finally {
        setBusy(false);
      }
    },
    [busy, commit],
  );

  const changeLayout = useCallback((next: WorkspaceLayout) => {
    setLayout(next);
    localStorage.setItem(LAYOUT_KEY, next);
    recordProductEvent("layout_changed");
  }, []);

  const changeZoom = useCallback((next: PageZoom) => {
    setZoom(next);
    localStorage.setItem(ZOOM_KEY, String(next));
  }, []);

  const moveDraggedItem = useCallback(
    (active: DraggableItem, over: DropTarget) => {
      if (active.kind === "document") {
        commit(
          reorderDocuments(
            documentsRef.current,
            active.documentId,
            over.documentId,
          ),
        );
        return;
      }
      const next =
        over.kind === "page"
          ? movePage(documentsRef.current, active.pageId, over.pageId)
          : over.kind === "document-end" || over.kind === "document"
            ? movePageToDocumentEnd(
                documentsRef.current,
                active.pageId,
                over.documentId,
              )
            : documentsRef.current;
      if (next !== documentsRef.current) {
        commit(next);
        recordProductEvent("page_moved");
      }
    },
    [commit],
  );

  const exportPdf = useCallback(async (request: ExportRequest) => {
    if (busy || documentsRef.current.length === 0) return;
    setBusy(true);
    try {
      const successNotice = await createWorkspaceDownload(
        documentsRef.current,
        request,
        (message) => setNotice({ tone: "info", message }),
      );
      recordProductEvent("merge_completed");
      setNotice(successNotice);
    } catch {
      recordProductEvent("merge_failed");
      setNotice({
        tone: "error",
        message: "Verification failed. No output was downloaded.",
      });
    } finally {
      setBusy(false);
    }
  }, [busy]);

  const undo = useCallback(() => {
    const previous = past.at(-1);
    if (!previous) return;
    setPast(past.slice(0, -1));
    setFuture([...future, documentsRef.current]);
    documentsRef.current = previous;
    setDocuments(previous);
  }, [future, past]);

  const redo = useCallback(() => {
    const next = future.at(-1);
    if (!next) return;
    setFuture(future.slice(0, -1));
    setPast([...past, documentsRef.current]);
    documentsRef.current = next;
    setDocuments(next);
  }, [future, past]);

  const clearWorkspace = useCallback(() => {
    thumbnailUrls.current.forEach((url) => URL.revokeObjectURL(url));
    thumbnailUrls.current.clear();
    setPast([]);
    setFuture([]);
    documentsRef.current = [];
    setDocuments([]);
    setNotice({
      tone: "success",
      message: "Workspace memory cleared. No PDF content was retained.",
    });
  }, []);

  return {
    documents,
    layout,
    zoom,
    busy,
    notice,
    totals,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    addFiles,
    changeLayout,
    zoomIn: () => changeZoom(adjacentZoom(zoom, 1)),
    zoomOut: () => changeZoom(adjacentZoom(zoom, -1)),
    moveDraggedItem,
    exportPdf,
    undo,
    redo,
    clear: clearWorkspace,
    rename: (id: string, name: string) =>
      commit(renameDocument(documentsRef.current, id, name)),
    removeDocument: (id: string) =>
      commit(removeDocument(documentsRef.current, id)),
    removePage: (id: string) => commit(removePage(documentsRef.current, id)),
    dismissNotice: () => setNotice(null),
  };
}
