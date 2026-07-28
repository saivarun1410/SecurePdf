import type { PageZoom } from "../../documents/types/documentTypes";

interface PageZoomControlProps {
  readonly value: PageZoom;
  readonly onZoomIn: () => void;
  readonly onZoomOut: () => void;
}

export function PageZoomControl({
  value,
  onZoomIn,
  onZoomOut,
}: PageZoomControlProps): React.JSX.Element {
  return (
    <div className="page-zoom" aria-label="PDF page zoom">
      <button onClick={onZoomOut} disabled={value === 75} aria-label="Zoom pages out">
        −
      </button>
      <span>{value}%</span>
      <button onClick={onZoomIn} disabled={value === 200} aria-label="Zoom pages in">
        +
      </button>
    </div>
  );
}
