export interface PdfSource {
  readonly id: string;
  readonly fileName: string;
  readonly bytes: Uint8Array;
}

export interface PdfPage {
  readonly id: string;
  readonly source: PdfSource;
  readonly sourcePageIndex: number;
  readonly width: number;
  readonly height: number;
  readonly thumbnailUrl: string;
}

export interface PdfDocumentItem {
  readonly id: string;
  readonly name: string;
  readonly pages: PdfPage[];
}

export type WorkspaceLayout = "rows" | "columns";

export interface ImportLimits {
  readonly maximumFileBytes: number;
  readonly maximumTotalBytes: number;
  readonly maximumTotalPages: number;
}
