"use client";

import { useRef, useState } from "react";
import { useSecureWorkspace } from "../hooks/useSecureWorkspace";
import { useTheme } from "../../theme/hooks/useTheme";
import { DocumentCard } from "./DocumentCard";
import { EmptyWorkspace } from "./EmptyWorkspace";
import { WorkspaceToolbar } from "./WorkspaceToolbar";
import { SupportDialog } from "../../support/components/SupportDialog";
import type { DragItem } from "../types/dragTypes";

export function SecurePdfApp(): React.JSX.Element {
  const workspace = useSecureWorkspace();
  const appearance = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const [supportOpen, setSupportOpen] = useState(false);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const chooseFiles = () => inputRef.current?.click();

  return (
    <main
      className="app-shell"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        void workspace.addFiles(Array.from(event.dataTransfer.files));
      }}
      onDragEnd={() => setDraggedItem(null)}
    >
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
        theme={appearance.theme}
        documentCount={workspace.documents.length}
        pageCount={workspace.totals.pages}
        busy={workspace.busy}
        canUndo={workspace.canUndo}
        canRedo={workspace.canRedo}
        onAdd={chooseFiles}
        onLayout={workspace.changeLayout}
        onTheme={appearance.toggleTheme}
        onUndo={workspace.undo}
        onRedo={workspace.redo}
        onClear={workspace.clear}
        onExport={() => void workspace.exportPdf()}
        onSupport={() => setSupportOpen(true)}
      />
      {workspace.documents.length === 0 ? (
        <EmptyWorkspace busy={workspace.busy} onChoose={chooseFiles} />
      ) : (
        <section className={`document-workspace ${workspace.layout}`}>
          {workspace.documents.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              layout={workspace.layout}
              onRename={workspace.rename}
              onRemoveDocument={workspace.removeDocument}
              onRemovePage={workspace.removePage}
              onDragStart={setDraggedItem}
              onDrop={(target) => {
                if (draggedItem) workspace.moveDraggedItem(draggedItem, target);
                setDraggedItem(null);
              }}
            />
          ))}
        </section>
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
    </main>
  );
}
