interface EmptyWorkspaceProps {
  readonly busy: boolean;
  readonly onChoose: () => void;
}

export function EmptyWorkspace({
  busy,
  onChoose,
}: EmptyWorkspaceProps): React.JSX.Element {
  return (
    <section className="empty-workspace">
      <div className="empty-icon" aria-hidden="true">PDF</div>
      <h1>Arrange PDFs safely.</h1>
      <p>
        PDF contents stay only in this browser tab&apos;s memory—never uploaded,
        stored on our servers, logged, or sent to analytics. Reorder pages, then
        download only after every page passes independent verification.
      </p>
      <button className="empty-cta" onClick={onChoose} disabled={busy}>
        {busy ? "Inspecting…" : "Choose PDFs"}
      </button>
      <div className="quick-grid" aria-label="Privacy and integrity guarantees">
        <div><strong>01</strong><span>Contents stay in this tab</span></div>
        <div><strong>02</strong><span>Nothing stored on our servers</span></div>
        <div><strong>03</strong><span>Originals remain untouched</span></div>
        <div><strong>04</strong><span>Failed checks never download</span></div>
      </div>
      <nav className="legal-links" aria-label="Legal">
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
        <a href="/refunds">Refunds</a>
      </nav>
    </section>
  );
}
