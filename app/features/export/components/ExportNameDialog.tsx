"use client";

import { useState } from "react";
import { DEFAULT_EXPORT_TITLE } from "../services/exportFilenameService";
import type {
  ExportMode,
  ExportRequest,
} from "../types/exportTypes";

interface ExportNameDialogProps {
  readonly itemLabel: "row" | "column";
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onConfirm: (request: ExportRequest) => void;
}

interface ExportModeChoicesProps {
  readonly itemLabel: "row" | "column";
  readonly value: ExportMode;
  readonly onChange: (mode: ExportMode) => void;
}

function ExportModeChoices({
  itemLabel,
  value,
  onChange,
}: ExportModeChoicesProps): React.JSX.Element {
  return (
    <fieldset className="export-mode-choices">
      <legend>Download format</legend>
      <label>
        <input
          type="radio"
          name="export-mode"
          checked={value === "merged"}
          onChange={() => onChange("merged")}
        />
        <span>
          <strong>One merged PDF</strong>
          <small>All {itemLabel}s in their visible order.</small>
        </span>
      </label>
      <label>
        <input
          type="radio"
          name="export-mode"
          checked={value === "separate"}
          onChange={() => onChange("separate")}
        />
        <span>
          <strong>Separate PDFs (.zip)</strong>
          <small>One independently verified PDF per {itemLabel}.</small>
        </span>
      </label>
    </fieldset>
  );
}

export function ExportNameDialog({
  itemLabel,
  open,
  onClose,
  onConfirm,
}: ExportNameDialogProps): React.JSX.Element | null {
  const [title, setTitle] = useState(DEFAULT_EXPORT_TITLE);
  const [mode, setMode] = useState<ExportMode>("merged");

  if (!open) return null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onConfirm({ mode, title });
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
        <h2 id="export-name-title">Choose your download.</h2>
        <p>
          Every PDF is rebuilt from the visible page order and verified before
          anything downloads.
        </p>
        <form onSubmit={handleSubmit}>
          <ExportModeChoices
            itemLabel={itemLabel}
            value={mode}
            onChange={setMode}
          />
          <label htmlFor="export-title">
            {mode === "merged" ? "PDF title" : "ZIP title"}
          </label>
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
            <span aria-hidden="true">
              {mode === "merged" ? ".pdf" : ".zip"}
            </span>
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
