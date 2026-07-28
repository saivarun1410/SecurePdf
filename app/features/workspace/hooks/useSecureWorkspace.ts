"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { importPdfFile } from "../../documents/services/pdfImportService";
import { PdfSecurityError } from "../../documents/services/pdfSecurityPolicy";
import type {
  PdfDocumentItem,
  WorkspaceLayout,
} from "../../documents/types/documentTypes";
import {
  createVerifiedPdf,
  downloadVerifiedPdf,
} from "../../export/services/pdfExportService";
import {
  recordProductEvent,
  captureCampaignSource,
} from "../../analytics/services/localAnalytics";
import {
  movePage,
  removeDocument,
  removePage,
  renameDocument,
  reorderDocuments,
} from "../services/workspaceOperations";
import type { DragItem } from "../types/dragTypes";

export interface WorkspaceNotice {
  readonly tone: "info" | "success" | "error";
  readonly message: string;
}

const LAYOUT_KEY = "securepdf:layout";
const HISTORY_LIMIT = 30;

function workspaceByteCount(documents: PdfDocumentItem[]): number {
  const sources = new Map<string, number>();
  documents
    .flatMap((document) => document.pages)
    .forEach((page) => sources.set(page.source.id, page.source.bytes.byteLength));
  return Array.from(sources.values()).reduce((sum, bytes) => sum + bytes, 0);
}

export function useSecureWorkspace() {
  const [documents, setDocuments] = useState<PdfDocumentItem[]>([]);
  const [layout, setLayout] = useState<WorkspaceLayout>("rows");
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
    const stored = localStorage.getItem(LAYOUT_KEY);
    const timer = window.setTimeout(() => {
      if (stored === "rows" || stored === "columns") setLayout(stored);
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
        const message =
          error instanceof PdfSecurityError
            ? error.message
            : "This PDF could not be safely opened and was rejected.";
        setNotice({ tone: "error", message });
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

  const moveDraggedItem = useCallback(
    (active: DragItem, over: DragItem) => {
      if (active.kind === "document" && over.kind === "document") {
        commit(
          reorderDocuments(
            documentsRef.current,
            active.documentId,
            over.documentId,
          ),
        );
      }
      if (active.kind === "page" && over.kind === "page") {
        commit(movePage(documentsRef.current, active.pageId, over.pageId));
        recordProductEvent("page_moved");
      }
    },
    [commit],
  );

  const exportPdf = useCallback(async () => {
    if (busy || documentsRef.current.length === 0) return;
    setBusy(true);
    try {
      const exported = await createVerifiedPdf(documentsRef.current, (message) =>
        setNotice({ tone: "info", message }),
      );
      downloadVerifiedPdf(exported);
      recordProductEvent("merge_completed");
      setNotice({
        tone: "success",
        message: `Verified ${exported.pageCount} pages · fingerprint ${exported.fingerprint}`,
      });
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

  return {
    documents,
    layout,
    busy,
    notice,
    totals,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    addFiles,
    changeLayout,
    moveDraggedItem,
    exportPdf,
    undo,
    redo,
    clear: () => commit([]),
    rename: (id: string, name: string) =>
      commit(renameDocument(documentsRef.current, id, name)),
    removeDocument: (id: string) =>
      commit(removeDocument(documentsRef.current, id)),
    removePage: (id: string) => commit(removePage(documentsRef.current, id)),
    dismissNotice: () => setNotice(null),
  };
}
