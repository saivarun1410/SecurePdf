import { describe, expect, it } from "vitest";
import {
  PdfSecurityError,
  validatePassivePdf,
  validateWorkspaceCapacity,
} from "../app/features/documents/services/pdfSecurityPolicy";

function bytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

describe("PDF security policy", () => {
  it("rejects digitally signed inputs rather than invalidating signatures", () => {
    expect(() => validatePassivePdf(bytes("%PDF-1.7 /Type /Sig"))).toThrow(
      PdfSecurityError,
    );
    expect(() => validatePassivePdf(bytes("%PDF-1.7 /ByteRange [0 12]"))).toThrow(
      PdfSecurityError,
    );
  });

  it("rejects interactive forms whose behavior may change during merging", () => {
    expect(() => validatePassivePdf(bytes("%PDF-1.7 /AcroForm 8 0 R"))).toThrow(
      "Interactive PDF forms",
    );
  });

  it("rejects active JavaScript and launch actions", () => {
    expect(() => validatePassivePdf(bytes("%PDF-1.7 /JavaScript"))).toThrow(
      "active or embedded content",
    );
    expect(() => validatePassivePdf(bytes("%PDF-1.7 /Launch"))).toThrow(
      PdfSecurityError,
    );
  });

  it("accepts passive PDF bytes", () => {
    expect(() => validatePassivePdf(bytes("%PDF-1.7 passive"))).not.toThrow();
  });

  it("fails closed when workspace page limits would be exceeded", () => {
    expect(() => validateWorkspaceCapacity(0, 99, 10, 2)).toThrow(
      "limited to 100 pages",
    );
  });
});
