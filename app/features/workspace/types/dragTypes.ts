export type DragItem =
  | { readonly kind: "document"; readonly documentId: string }
  | {
      readonly kind: "page";
      readonly documentId: string;
      readonly pageId: string;
    };
