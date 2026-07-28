import { useDroppable } from "@dnd-kit/core";
import type { DropTarget } from "../types/dragTypes";

interface DocumentEndDropZoneProps {
  readonly documentId: string;
}

export function DocumentEndDropZone({
  documentId,
}: DocumentEndDropZoneProps): React.JSX.Element {
  const target: DropTarget = { kind: "document-end", documentId };
  const droppable = useDroppable({
    id: `document-end:${documentId}`,
    data: { target },
  });
  return (
    <div
      ref={droppable.setNodeRef}
      className={`page-end-drop ${droppable.isOver ? "drop-target" : ""}`}
    >
      Drop page here
    </div>
  );
}
