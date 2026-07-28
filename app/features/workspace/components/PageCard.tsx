import { useDraggable, useDroppable } from "@dnd-kit/core";
import type { PdfPage } from "../../documents/types/documentTypes";
import type { DraggableItem } from "../types/dragTypes";

interface PageCardProps {
  readonly page: PdfPage;
  readonly documentId: string;
  readonly pageNumber: number;
  readonly onRemove: (pageId: string) => void;
}

export function PageCard({
  page,
  documentId,
  pageNumber,
  onRemove,
}: PageCardProps): React.JSX.Element {
  const dragItem: DraggableItem = {
    kind: "page",
    pageId: page.id,
    documentId,
  };
  const draggable = useDraggable({
    id: `page:${page.id}`,
    data: { item: dragItem },
  });
  const droppable = useDroppable({
    id: `page-target:${page.id}`,
    data: { target: dragItem },
  });
  const aspectRatio = `${page.width} / ${page.height}`;

  return (
    <article
      ref={droppable.setNodeRef}
      className={[
        "page-card",
        draggable.isDragging ? "dragging" : "",
        droppable.isOver ? "drop-target" : "",
      ].join(" ")}
    >
      <button
        ref={draggable.setNodeRef}
        className="page-grip"
        aria-label={`Move page ${pageNumber}`}
        {...draggable.attributes}
        {...draggable.listeners}
      >
        Drag
      </button>
      <img
        src={page.thumbnailUrl}
        alt={`Page ${pageNumber} preview`}
        width={900}
        height={Math.round((900 * page.height) / page.width)}
        style={{ aspectRatio }}
        draggable={false}
      />
      <footer>
        <span>Page {pageNumber}</span>
        <button
          aria-label={`Remove page ${pageNumber}`}
          onClick={() => onRemove(page.id)}
        >
          ×
        </button>
      </footer>
    </article>
  );
}
