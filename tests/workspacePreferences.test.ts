import { describe, expect, it } from "vitest";
import {
  adjacentZoom,
  parseStoredLayout,
  parseStoredZoom,
} from "../app/features/workspace/services/workspacePreferences";

describe("workspace preferences", () => {
  it("defaults unknown layouts and zoom levels safely", () => {
    expect(parseStoredLayout("unexpected")).toBe("rows");
    expect(parseStoredZoom("999")).toBe(100);
  });

  it("moves through page-only zoom levels without exceeding bounds", () => {
    expect(adjacentZoom(100, 1)).toBe(125);
    expect(adjacentZoom(100, -1)).toBe(75);
    expect(adjacentZoom(200, 1)).toBe(200);
    expect(adjacentZoom(75, -1)).toBe(75);
  });
});
