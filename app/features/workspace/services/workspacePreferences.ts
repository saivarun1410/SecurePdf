import type {
  PageZoom,
  WorkspaceLayout,
} from "../../documents/types/documentTypes";

export const PAGE_ZOOM_LEVELS: readonly PageZoom[] = [75, 100, 125, 150, 200];

export function parseStoredLayout(value: string | null): WorkspaceLayout {
  return value === "columns" ? "columns" : "rows";
}

export function parseStoredZoom(value: string | null): PageZoom {
  const parsed = Number(value);
  return PAGE_ZOOM_LEVELS.includes(parsed as PageZoom)
    ? (parsed as PageZoom)
    : 100;
}

export function adjacentZoom(current: PageZoom, direction: -1 | 1): PageZoom {
  const currentIndex = PAGE_ZOOM_LEVELS.indexOf(current);
  const nextIndex = Math.min(
    PAGE_ZOOM_LEVELS.length - 1,
    Math.max(0, currentIndex + direction),
  );
  return PAGE_ZOOM_LEVELS[nextIndex];
}
