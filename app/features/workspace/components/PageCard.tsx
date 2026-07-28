import type { PdfPage } from "../../documents/types/documentTypes";
import type { DragItem } from "../types/dragTypes";

interface PageCardProps {
  readonly page: PdfPage;
  readonly documentId: string;
  readonly pageNumber: number;
  readonly onRemove: (pageId: string) => void;
  readonly onDragStart: (item: DragItem) => void;
  readonly onDrop: (item: DragItem) => void;
}

export function PageCard({
  page,
  documentId,
  pageNumber,
  onRemove,
  onDragStart,
  onDrop,
}: PageCardProps): React.JSX.Element {
  const dragItem: DragItem = { kind: "page", pageId: page.id, documentId };
  return (
    <article
      className="page-card"
      draggable
      onDragStart={() => onDragStart(dragItem)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onDrop(dragItem);
      }}
    >
      {/* Blob-backed previews are generated locally and never sent to an optimizer. */}
      <img
        src={page.thumbnailUrl}
        alt={`Page ${pageNumber} preview`}
        width={180}
        height={220}
        draggable={false}
      />
      <footer>
        <span>Page {pageNumber}</span>
        <button
          aria-label={`Remove page ${pageNumber}`}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onRemove(page.id);
          }}
        >
          ×
        </button>
      </footer>
    </article>
  );
}
