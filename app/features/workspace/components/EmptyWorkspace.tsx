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
        Drop PDFs anywhere, reorder pages in rows or columns, then download only
        after every page passes independent verification.
      </p>
      <button className="empty-cta" onClick={onChoose} disabled={busy}>
        {busy ? "Inspecting…" : "Choose PDFs"}
      </button>
      <div className="quick-grid" aria-label="Privacy and integrity guarantees">
        <div><strong>01</strong><span>Files never upload</span></div>
        <div><strong>02</strong><span>Originals stay untouched</span></div>
        <div><strong>03</strong><span>Output is re-opened</span></div>
        <div><strong>04</strong><span>Failures never download</span></div>
      </div>
      <nav className="legal-links" aria-label="Legal">
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
        <a href="/refunds">Refunds</a>
      </nav>
    </section>
  );
}
