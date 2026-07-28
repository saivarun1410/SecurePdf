import { getSupportOptions } from "../services/supportLinks";
import { recordProductEvent } from "../../analytics/services/localAnalytics";

interface SupportDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

export function SupportDialog({
  open,
  onClose,
}: SupportDialogProps): React.JSX.Element | null {
  if (!open) return null;
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="support-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="dialog-close" aria-label="Close" onClick={onClose}>×</button>
        <div className="dialog-icon" aria-hidden="true">☕</div>
        <h2 id="support-title">Keep SecurePDF free.</h2>
        <p>
          If this tool saved you time, you can make an optional contribution.
        </p>
        <div className="support-options">
          {getSupportOptions().map((option) =>
            option.href ? (
              <a
                key={option.label}
                href={option.href}
                target="_blank"
                rel="noreferrer"
                onClick={() => recordProductEvent("support_opened")}
              >
                <strong>{option.label}</strong>
                <span>{option.description}</span>
              </a>
            ) : (
              <button key={option.label} disabled>
                <strong>{option.label}</strong>
                <span>Payment setup in progress</span>
              </button>
            ),
          )}
        </div>
        <small>Support is optional. It never changes access to the tool.</small>
        <nav className="dialog-legal" aria-label="Support policies">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/refunds">Refunds</a>
        </nav>
      </section>
    </div>
  );
}
