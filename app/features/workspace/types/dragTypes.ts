export type DraggableItem =
  | { readonly kind: "document"; readonly documentId: string }
  | {
      readonly kind: "page";
      readonly documentId: string;
      readonly pageId: string;
    };

export type DropTarget =
  | DraggableItem
  | { readonly kind: "document-end"; readonly documentId: string };
