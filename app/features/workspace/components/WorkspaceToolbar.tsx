import { LayoutToggle } from "./LayoutToggle";
import type { WorkspaceLayout } from "../../documents/types/documentTypes";
import type { ColorTheme } from "../../theme/hooks/useTheme";

interface WorkspaceToolbarProps {
  readonly layout: WorkspaceLayout;
  readonly theme: ColorTheme;
  readonly documentCount: number;
  readonly pageCount: number;
  readonly busy: boolean;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly onAdd: () => void;
  readonly onLayout: (layout: WorkspaceLayout) => void;
  readonly onTheme: () => void;
  readonly onUndo: () => void;
  readonly onRedo: () => void;
  readonly onClear: () => void;
  readonly onExport: () => void;
  readonly onSupport: () => void;
}

export function WorkspaceToolbar(props: WorkspaceToolbarProps): React.JSX.Element {
  const hasDocuments = props.documentCount > 0;
  return (
    <header className="toolbar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">S</span>
        <strong>SecurePDF</strong>
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
          </>
        )}
      </div>
      <nav className="toolbar-actions" aria-label="Workspace actions">
        {hasDocuments && (
          <>
            <button onClick={props.onUndo} disabled={!props.canUndo}>Undo</button>
            <button onClick={props.onRedo} disabled={!props.canRedo}>Redo</button>
            <button className="danger" onClick={props.onClear}>Clear</button>
          </>
        )}
        <button
          className="square-action"
          onClick={props.onTheme}
          aria-label={`Use ${props.theme === "light" ? "dark" : "light"} theme`}
          title="Toggle theme"
        >
          {props.theme === "light" ? "◐" : "○"}
        </button>
        <button onClick={props.onSupport}>Support</button>
        <button onClick={props.onAdd} disabled={props.busy}>Add PDFs</button>
        <button
          className="primary-action"
          onClick={props.onExport}
          disabled={!hasDocuments || props.busy}
        >
          {props.busy ? "Working…" : "Verify & download"}
        </button>
      </nav>
    </header>
  );
}
