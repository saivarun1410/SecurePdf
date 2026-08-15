import { describe, expect, it } from "vitest";
import { getSupportOptions } from "../app/features/support/services/supportLinks";

describe("support payment labels", () => {
  it("keeps support options unavailable during review", () => {
    const supportOptions = getSupportOptions();

    expect(supportOptions.map((option) => option.label)).toEqual([
      "Support from India",
      "Support from outside India",
    ]);
    expect(supportOptions.every((option) => option.href === undefined)).toBe(
      true,
    );
  });

  it("explains the option for contributors outside India", () => {
    const internationalOption = getSupportOptions().find(
      (option) => option.label === "Support from outside India",
    );

    expect(internationalOption).toMatchObject({
      description:
        "Send a contribution to India using an international card.",
    });
  });
});
