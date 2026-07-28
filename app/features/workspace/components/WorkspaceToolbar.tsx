import type {
  PageZoom,
  WorkspaceLayout,
} from "../../documents/types/documentTypes";
import type { ColorTheme } from "../../theme/hooks/useTheme";
import { ExportNameDialog } from "../../export/components/ExportNameDialog";
import type { ExportRequest } from "../../export/types/exportTypes";
import { useState } from "react";
import { LayoutToggle } from "./LayoutToggle";
import { PageZoomControl } from "./PageZoomControl";

interface WorkspaceToolbarProps {
  readonly layout: WorkspaceLayout;
  readonly zoom: PageZoom;
  readonly theme: ColorTheme;
  readonly documentCount: number;
  readonly pageCount: number;
  readonly busy: boolean;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly onAdd: () => void;
  readonly onLayout: (layout: WorkspaceLayout) => void;
  readonly onZoomIn: () => void;
  readonly onZoomOut: () => void;
  readonly onTheme: () => void;
  readonly onUndo: () => void;
  readonly onRedo: () => void;
  readonly onClear: () => void;
  readonly onExport: (request: ExportRequest) => void;
  readonly onSupport: () => void;
  readonly onContact: () => void;
}

function SecondaryActions(props: WorkspaceToolbarProps): React.JSX.Element {
  const hasDocuments = props.documentCount > 0;
  return (
    <>
      {hasDocuments && (
        <>
          <button onClick={props.onUndo} disabled={!props.canUndo}>Undo</button>
          <button onClick={props.onRedo} disabled={!props.canRedo}>Redo</button>
          <button className="danger" onClick={props.onClear}>Clear</button>
        </>
      )}
      <button onClick={props.onTheme}>
        {props.theme === "light" ? "Dark mode" : "Light mode"}
      </button>
      <button onClick={props.onSupport}>Support</button>
      <button onClick={props.onContact}>Contact</button>
    </>
  );
}

function ExportAction(props: WorkspaceToolbarProps): React.JSX.Element {
  const [dialogOpen, setDialogOpen] = useState(false);
  const hasDocuments = props.documentCount > 0;
  const confirmExport = (request: ExportRequest) => {
    setDialogOpen(false);
    props.onExport(request);
  };

  return (
    <>
      <button
        className="primary-action"
        aria-label={props.busy ? "Working" : "Verify and download"}
        onClick={() => setDialogOpen(true)}
        disabled={!hasDocuments || props.busy}
      >
        <span className="action-full">
          {props.busy ? "Working…" : "Verify & download"}
        </span>
        <span className="action-short" aria-hidden="true">
          {props.busy ? "…" : "Verify"}
        </span>
      </button>
      <ExportNameDialog
        itemLabel={props.layout === "rows" ? "row" : "column"}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={confirmExport}
      />
    </>
  );
}

export function WorkspaceToolbar(props: WorkspaceToolbarProps): React.JSX.Element {
  const hasDocuments = props.documentCount > 0;
  return (
    <header className="toolbar">
      <div className="brand">
        <strong>RealSecurePdf</strong>
        <span className="brand-badge">Free</span>
      </div>
      <div className="toolbar-center">
        {hasDocuments && (
          <>
            <span className="document-count">
              {props.documentCount} {props.documentCount === 1 ? "document" : "documents"}
              <i>·</i>
              {props.pageCount} {props.pageCount === 1 ? "page" : "pages"}
            </span>
            <LayoutToggle value={props.layout} onChange={props.onLayout} />
            <PageZoomControl
              value={props.zoom}
              onZoomIn={props.onZoomIn}
              onZoomOut={props.onZoomOut}
            />
          </>
        )}
      </div>
      <nav className="toolbar-actions" aria-label="Workspace actions">
        <div className="desktop-actions">
          <SecondaryActions {...props} />
        </div>
        <details className="mobile-actions">
          <summary aria-label="More workspace actions">•••</summary>
          <div><SecondaryActions {...props} /></div>
        </details>
        <button
          className="add-action"
          aria-label="Add PDFs"
          onClick={props.onAdd}
          disabled={props.busy}
        >
          <span className="action-full">Add PDFs</span>
          <span className="action-short" aria-hidden="true">+</span>
        </button>
        <ExportAction {...props} />
      </nav>
    </header>
  );
}
