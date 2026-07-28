type ProductEvent =
  | "files_added"
  | "layout_changed"
  | "page_moved"
  | "merge_completed"
  | "merge_failed"
  | "support_opened";

const EVENT_KEY = "realsecurepdf:event-counts";
const SOURCE_KEY = "realsecurepdf:campaign-source";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function captureCampaignSource(): void {
  if (!canUseStorage() || localStorage.getItem(SOURCE_KEY)) return;
  const query = new URLSearchParams(window.location.search);
  const source = query.get("utm_source");
  if (source) localStorage.setItem(SOURCE_KEY, source.slice(0, 64));
}

export function recordProductEvent(event: ProductEvent): void {
  if (!canUseStorage()) return;
  const stored = localStorage.getItem(EVENT_KEY);
  const counts = stored ? (JSON.parse(stored) as Record<string, number>) : {};
  counts[event] = (counts[event] ?? 0) + 1;
  localStorage.setItem(EVENT_KEY, JSON.stringify(counts));
}
