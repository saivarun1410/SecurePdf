import { useContactForm } from "../hooks/useContactForm";

interface ContactDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

export function ContactDialog({
  open,
  onClose,
}: ContactDialogProps): React.JSX.Element | null {
  const form = useContactForm();
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void form.submit();
  };

  if (!open) return null;
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="support-dialog contact-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="dialog-close" aria-label="Close" onClick={onClose}>
          ×
        </button>
        <span className="dialog-kicker">Contact</span>
        <h2 id="contact-title">Tell us what needs fixing.</h2>
        <p>
          This form sends only what you type below. It never includes PDFs,
          filenames, page counts, or workspace activity.
        </p>
        {form.state === "success" ? (
          <div className="contact-success" role="status">
            Message sent. Thank you for helping improve SecurePDF.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="contact-name">
              Name
              <input
                id="contact-name"
                name="name"
                value={form.fields.name}
                onChange={(event) => form.update("name", event.target.value)}
                autoComplete="name"
                aria-describedby={form.error ? "contact-error" : undefined}
                required
              />
            </label>
            <label htmlFor="contact-email">
              Email
              <input
                id="contact-email"
                name="email"
                type="email"
                value={form.fields.email}
                onChange={(event) => form.update("email", event.target.value)}
                autoComplete="email"
                aria-describedby={form.error ? "contact-error" : undefined}
                required
              />
            </label>
            <label htmlFor="contact-message">
              Message
              <textarea
                id="contact-message"
                name="message"
                value={form.fields.message}
                onChange={(event) => form.update("message", event.target.value)}
                minLength={10}
                rows={5}
                aria-describedby={form.error ? "contact-error" : undefined}
                required
              />
            </label>
            {form.error && (
              <p id="contact-error" className="contact-error" role="alert">
                {form.error}
              </p>
            )}
            <button
              className="contact-submit"
              type="submit"
              disabled={form.state === "sending"}
            >
              {form.state === "sending" ? "Sending…" : "Send message"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
