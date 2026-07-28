export type ExportMode = "merged" | "separate";

export interface ExportRequest {
  readonly mode: ExportMode;
  readonly title: string;
}
