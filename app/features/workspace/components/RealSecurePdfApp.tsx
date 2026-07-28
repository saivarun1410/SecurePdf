"use client";

import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useRef, useState, type CSSProperties, type DragEvent } from "react";
import { ContactDialog } from "../../contact/components/ContactDialog";
import { SeoContent } from "../../seo/components/SeoContent";
import { SupportDialog } from "../../support/components/SupportDialog";
import { useTheme } from "../../theme/hooks/useTheme";
import { useSecureWorkspace } from "../hooks/useSecureWorkspace";
import type { DraggableItem, DropTarget } from "../types/dragTypes";
import { AddDocumentCard } from "./AddDocumentCard";
import { DocumentCard } from "./DocumentCard";
import { EmptyWorkspace } from "./EmptyWorkspace";
import { PrivacyStrip } from "./PrivacyStrip";
import { WorkspaceToolbar } from "./WorkspaceToolbar";

export function RealSecurePdfApp(): React.JSX.Element {
  const workspace = useSecureWorkspace();
  const appearance = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const [supportOpen, setSupportOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<DraggableItem | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 160, tolerance: 8 },
    }),
    useSensor(KeyboardSensor),
  );
  const chooseFiles = () => inputRef.current?.click();

  const handleFileDrop = (event: DragEvent<HTMLElement>) => {
    const files = Array.from(event.dataTransfer.files);
    if (files.length === 0) return;
    event.preventDefault();
    void workspace.addFiles(files);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const item = event.active.data.current?.item as DraggableItem | undefined;
    setActiveItem(item ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const item = event.active.data.current?.item as DraggableItem | undefined;
    const target = event.over?.data.current?.target as DropTarget | undefined;
    if (item && target) workspace.moveDraggedItem(item, target);
    setActiveItem(null);
  };

  const zoomStyle = {
    "--page-scale": workspace.zoom / 100,
  } as CSSProperties;

  return (
    <main className="app-shell" style={zoomStyle} onDrop={handleFileDrop}>
      <input
        ref={inputRef}
        className="visually-hidden"
        type="file"
        accept="application/pdf,.pdf"
        multiple
        onChange={(event) => {
          void workspace.addFiles(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />
      <WorkspaceToolbar
        layout={workspace.layout}
        zoom={workspace.zoom}
        theme={appearance.theme}
        documentCount={workspace.documents.length}
        pageCount={workspace.totals.pages}
        busy={workspace.busy}
        canUndo={workspace.canUndo}
        canRedo={workspace.canRedo}
        onAdd={chooseFiles}
        onLayout={workspace.changeLayout}
        onZoomIn={workspace.zoomIn}
        onZoomOut={workspace.zoomOut}
        onTheme={appearance.toggleTheme}
        onUndo={workspace.undo}
        onRedo={workspace.redo}
        onClear={workspace.clear}
        onExport={(request) => void workspace.exportPdf(request)}
        onSupport={() => setSupportOpen(true)}
        onContact={() => setContactOpen(true)}
      />
      <PrivacyStrip />
      {workspace.documents.length === 0 ? (
        <>
          <EmptyWorkspace busy={workspace.busy} onChoose={chooseFiles} />
          <SeoContent />
        </>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveItem(null)}
        >
          <section className={`document-workspace ${workspace.layout}`}>
            {workspace.documents.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                layout={workspace.layout}
                onRename={workspace.rename}
                onRemoveDocument={workspace.removeDocument}
                onRemovePage={workspace.removePage}
              />
            ))}
            <AddDocumentCard
              layout={workspace.layout}
              busy={workspace.busy}
              onChoose={chooseFiles}
            />
          </section>
          <DragOverlay>
            {activeItem && (
              <div className="drag-overlay">
                {activeItem.kind === "page" ? "Moving page" : "Moving document"}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}
      {workspace.notice && (
        <button
          className={`notice ${workspace.notice.tone}`}
          onClick={workspace.dismissNotice}
          aria-label="Dismiss message"
        >
          <span>{workspace.notice.message}</span>
          <i aria-hidden="true">×</i>
        </button>
      )}
      <SupportDialog open={supportOpen} onClose={() => setSupportOpen(false)} />
      <ContactDialog open={contactOpen} onClose={() => setContactOpen(false)} />
    </main>
  );
}
