import type { ImportLimits } from "../types/documentTypes";
import type { PDFDocument } from "pdf-lib";

const PDF_EXTENSION = /\.pdf$/i;
const SIGNATURE_PATTERNS = [/\/Type\s*\/Sig\b/i, /\/ByteRange\s*\[/i];
const ACTIVE_CONTENT_PATTERNS = [
  /\/JavaScript\b/i,
  /\/Launch\b/i,
  /\/EmbeddedFiles\b/i,
];

export const IMPORT_LIMITS: ImportLimits = {
  maximumFileBytes: 100 * 1024 * 1024,
  maximumTotalBytes: 150 * 1024 * 1024,
  maximumTotalPages: 100,
};

export class PdfSecurityError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "PdfSecurityError";
  }
}

export function validateFileBoundary(file: File): void {
  if (!PDF_EXTENSION.test(file.name)) {
    throw new PdfSecurityError("NOT_PDF", `${file.name} is not a PDF file.`);
  }
  if (file.size === 0) {
    throw new PdfSecurityError("EMPTY_FILE", `${file.name} is empty.`);
  }
  if (file.size > IMPORT_LIMITS.maximumFileBytes) {
    throw new PdfSecurityError(
      "FILE_TOO_LARGE",
      `${file.name} is larger than the 100 MB safety limit.`,
    );
  }
}

export function validateWorkspaceCapacity(
  currentBytes: number,
  currentPages: number,
  incomingBytes: number,
  incomingPages: number,
): void {
  if (currentBytes + incomingBytes > IMPORT_LIMITS.maximumTotalBytes) {
    throw new PdfSecurityError(
      "WORKSPACE_TOO_LARGE",
      "The workspace would exceed the 150 MB safety limit.",
    );
  }
  if (currentPages + incomingPages > IMPORT_LIMITS.maximumTotalPages) {
    throw new PdfSecurityError(
      "TOO_MANY_PAGES",
      `The workspace is limited to ${IMPORT_LIMITS.maximumTotalPages} pages.`,
    );
  }
}

export function validatePassivePdf(bytes: Uint8Array): void {
  const searchable = new TextDecoder("latin1").decode(bytes);
  const signature = SIGNATURE_PATTERNS.find((pattern) => pattern.test(searchable));
  if (signature) {
    throw new PdfSecurityError(
      "SIGNED_PDF",
      "Digitally signed PDFs are not accepted because merging invalidates signatures.",
    );
  }
  const activeContent = ACTIVE_CONTENT_PATTERNS.find((pattern) =>
    pattern.test(searchable),
  );
  if (activeContent) {
    throw new PdfSecurityError(
      "ACTIVE_CONTENT",
      "This PDF contains active or embedded content and was rejected for safety.",
    );
  }
}

export function validateDocumentFormSafety(document: PDFDocument): void {
  const form = document.getForm();
  const fields = form.getFields();
  const hasSignature = fields.some(
    (field) => field.constructor.name === "PDFSignature",
  );
  if (hasSignature) {
    throw new PdfSecurityError(
      "SIGNED_PDF",
      "This PDF contains a digital signature. Merging would invalidate it, so the file was left untouched.",
    );
  }
  if (form.hasXFA() || fields.length > 0) {
    throw new PdfSecurityError(
      "INTERACTIVE_FORM",
      "This PDF has live form fields. Merging can detach their values or behavior. Print or export a static copy, then add that copy.",
    );
  }
}
