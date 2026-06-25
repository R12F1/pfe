import { describe, it, expect } from "vitest";
import { truncatePatch, truncateFilePatch } from "../src/llm/patch-utils.js";
import type { PullRequestFileData } from "../src/domain/pull-request-data.js";

describe("truncatePatch", () => {
  it("retourne undefined si le patch est undefined", () => {
    expect(truncatePatch(undefined, 10)).toBeUndefined();
  });

  it("ne modifie pas un patch court", () => {
    const patch = "line1\nline2\nline3";
    expect(truncatePatch(patch, 10)).toBe(patch);
  });

  it("tronque un patch trop long", () => {
    const patch = Array.from({ length: 20 }, (_, i) => `line${i}`).join("\n");
    const result = truncatePatch(patch, 5);
    expect(result).toBeDefined();
    expect(result!.split("\n").length).toBeLessThan(20);
  });

  it("ajoute le texte indiquant les lignes tronquées", () => {
    const patch = Array.from({ length: 20 }, (_, i) => `line${i}`).join("\n");
    const result = truncatePatch(patch, 5);
    expect(result).toContain("(15 more lines truncated)");
  });
});

describe("truncateFilePatch", () => {
  it("tronque le patch du fichier sans muter l'original", () => {
    const file: PullRequestFileData = {
      filename: "src/a.ts",
      status: "modified",
      additions: 1,
      deletions: 0,
      changes: 1,
      patch: Array.from({ length: 200 }, (_, i) => `l${i}`).join("\n"),
    };
    const result = truncateFilePatch(file, 10);
    expect(result.patch).toContain("more lines truncated");
    expect(file.patch!.split("\n").length).toBe(200);
  });
});
