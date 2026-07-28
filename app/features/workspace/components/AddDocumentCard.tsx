import type { WorkspaceLayout } from "../../documents/types/documentTypes";

interface AddDocumentCardProps {
  readonly layout: WorkspaceLayout;
  readonly busy: boolean;
  readonly onChoose: () => void;
}

export function AddDocumentCard({
  layout,
  busy,
  onChoose,
}: AddDocumentCardProps): React.JSX.Element {
  return (
    <button
      className={`add-document-card ${layout}`}
      onClick={onChoose}
      disabled={busy}
    >
      <strong>{busy ? "Inspecting PDFs…" : "+ Add another PDF"}</strong>
      <span>
        Creates a separate {layout === "rows" ? "row below" : "column beside"}{" "}
        the current documents
      </span>
    </button>
  );
}
