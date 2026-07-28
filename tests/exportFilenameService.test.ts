import { describe, expect, it } from "vitest";
import {
  DEFAULT_EXPORT_TITLE,
  resolveExportName,
} from "../app/features/export/services/exportFilenameService";

describe("export filename resolution", () => {
  it("removes a supplied extension and unsafe filename characters", () => {
    expect(resolveExportName("  Client / Contract.pdf  ")).toEqual({
      documentTitle: "Client Contract",
      filenameStem: "Client Contract",
    });
  });

  it("falls back to a safe title when no usable characters remain", () => {
    expect(resolveExportName("///")).toEqual({
      documentTitle: DEFAULT_EXPORT_TITLE,
      filenameStem: DEFAULT_EXPORT_TITLE,
    });
  });
});
