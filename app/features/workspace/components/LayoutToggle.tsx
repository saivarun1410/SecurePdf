import type { WorkspaceLayout } from "../../documents/types/documentTypes";

interface LayoutToggleProps {
  readonly value: WorkspaceLayout;
  readonly onChange: (layout: WorkspaceLayout) => void;
}

export function LayoutToggle({
  value,
  onChange,
}: LayoutToggleProps): React.JSX.Element {
  return (
    <div className="layout-toggle" aria-label="Workspace layout">
      <button
        className={value === "rows" ? "active" : ""}
        aria-pressed={value === "rows"}
        onClick={() => onChange("rows")}
      >
        Rows
      </button>
      <button
        className={value === "columns" ? "active" : ""}
        aria-pressed={value === "columns"}
        onClick={() => onChange("columns")}
      >
        Columns
      </button>
    </div>
  );
}
