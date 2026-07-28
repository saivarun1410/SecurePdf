"use client";

import { useState } from "react";
import { DEFAULT_EXPORT_TITLE } from "../services/exportFilenameService";

interface ExportNameDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onConfirm: (title: string) => void;
}

export function ExportNameDialog({
  open,
  onClose,
  onConfirm,
}: ExportNameDialogProps): React.JSX.Element | null {
  const [title, setTitle] = useState(DEFAULT_EXPORT_TITLE);

  if (!open) return null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onConfirm(title);
  };

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="support-dialog export-name-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-name-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="dialog-close" aria-label="Close" onClick={onClose}>
          ×
        </button>
        <span className="dialog-kicker">Download</span>
        <h2 id="export-name-title">Name your merged PDF.</h2>
        <p>
          SecurePDF will verify the file, add its fingerprint, and then download
          it with this name.
        </p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="export-title">PDF title</label>
          <div className="export-name-field">
            <input
              id="export-title"
              name="title"
              value={title}
              maxLength={80}
              autoFocus
              required
              onChange={(event) => setTitle(event.target.value)}
            />
            <span aria-hidden="true">.pdf</span>
          </div>
          <div className="export-name-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="contact-submit" type="submit">
              Verify &amp; download
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
