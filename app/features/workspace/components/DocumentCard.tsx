import { useDraggable, useDroppable } from "@dnd-kit/core";
import type {
  PdfDocumentItem,
  WorkspaceLayout,
} from "../../documents/types/documentTypes";
import type { DraggableItem } from "../types/dragTypes";
import { DocumentEndDropZone } from "./DocumentEndDropZone";
import { PageCard } from "./PageCard";

interface DocumentCardProps {
  readonly document: PdfDocumentItem;
  readonly layout: WorkspaceLayout;
  readonly onRename: (documentId: string, name: string) => void;
  readonly onRemoveDocument: (documentId: string) => void;
  readonly onRemovePage: (pageId: string) => void;
}

export function DocumentCard(props: DocumentCardProps): React.JSX.Element {
  const dragItem: DraggableItem = {
    kind: "document",
    documentId: props.document.id,
  };
  const draggable = useDraggable({
    id: `document:${props.document.id}`,
    data: { item: dragItem },
  });
  const droppable = useDroppable({
    id: `document-target:${props.document.id}`,
    data: { target: dragItem },
  });

  return (
    <section
      ref={droppable.setNodeRef}
      className={[
        "document-card",
        props.layout,
        draggable.isDragging ? "dragging" : "",
        droppable.isOver ? "document-drop-target" : "",
      ].join(" ")}
    >
      <header className="document-header">
        <button
          ref={draggable.setNodeRef}
          className="drag-handle"
          aria-label={`Move ${props.document.name}`}
          {...draggable.attributes}
          {...draggable.listeners}
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
          />
        ))}
        <DocumentEndDropZone documentId={props.document.id} />
      </div>
    </section>
  );
}
