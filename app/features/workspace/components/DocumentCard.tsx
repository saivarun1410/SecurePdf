import type {
  PdfDocumentItem,
  WorkspaceLayout,
} from "../../documents/types/documentTypes";
import { PageCard } from "./PageCard";
import type { DragItem } from "../types/dragTypes";

interface DocumentCardProps {
  readonly document: PdfDocumentItem;
  readonly layout: WorkspaceLayout;
  readonly onRename: (documentId: string, name: string) => void;
  readonly onRemoveDocument: (documentId: string) => void;
  readonly onRemovePage: (pageId: string) => void;
  readonly onDragStart: (item: DragItem) => void;
  readonly onDrop: (item: DragItem) => void;
}

export function DocumentCard(props: DocumentCardProps): React.JSX.Element {
  const dragItem: DragItem = {
    kind: "document",
    documentId: props.document.id,
  };
  return (
    <section
      className={`document-card ${props.layout}`}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => props.onDrop(dragItem)}
    >
      <header className="document-header">
        <button
          className="drag-handle"
          aria-label={`Move ${props.document.name}`}
          draggable
          onDragStart={() => props.onDragStart(dragItem)}
        >
          ⠿
        </button>
        <div className="document-title">
          <input
            key={props.document.name}
            defaultValue={props.document.name}
            aria-label="Document name"
            onBlur={(event) =>
              props.onRename(props.document.id, event.currentTarget.value)
            }
          />
          <span>
            {props.document.pages.length}{" "}
            {props.document.pages.length === 1 ? "page" : "pages"}
          </span>
        </div>
        <button
          className="remove-document"
          aria-label={`Remove ${props.document.name}`}
          onClick={() => props.onRemoveDocument(props.document.id)}
        >
          Remove
        </button>
      </header>
      <div className="page-strip">
        {props.document.pages.map((page, index) => (
          <PageCard
            key={page.id}
            page={page}
            documentId={props.document.id}
            pageNumber={index + 1}
            onRemove={props.onRemovePage}
            onDragStart={props.onDragStart}
            onDrop={props.onDrop}
          />
        ))}
      </div>
    </section>
  );
}
