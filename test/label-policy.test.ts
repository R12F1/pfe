import { describe, it, expect } from "vitest";
import { filterValidSuggestions } from "../src/labels/label-policy.js";
import type { LabelSuggestion } from "../src/domain/label-suggestion.js";

describe("filterValidSuggestions", () => {
  const repoLabels = ["bug", "feature", "tests", "documentation"];

  it("retire les suggestions avec une confidence trop basse", () => {
    const suggestions: LabelSuggestion[] = [
      { name: "bug", confidence: 0.5, reason: "" },
      { name: "feature", confidence: 0.9, reason: "" },
    ];

    const result = filterValidSuggestions(suggestions, repoLabels, 0.7);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("feature");
  });

  it("retire les labels qui ne sont pas dans le repo", () => {
    const suggestions: LabelSuggestion[] = [
      { name: "unknown-label", confidence: 0.95, reason: "" },
      { name: "bug", confidence: 0.85, reason: "" },
    ];

    const result = filterValidSuggestions(suggestions, repoLabels);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("bug");
  });

  it("limite à maxLabels suggestions triées par confidence décroissante", () => {
    const suggestions: LabelSuggestion[] = [
      { name: "bug", confidence: 0.85, reason: "" },
      { name: "feature", confidence: 0.95, reason: "" },
      { name: "tests", confidence: 0.75, reason: "" },
      { name: "documentation", confidence: 0.9, reason: "" },
    ];

    const result = filterValidSuggestions(suggestions, repoLabels, 0.7, 3);
    expect(result).toHaveLength(3);
    expect(result.map((s) => s.name)).toEqual([
      "feature",
      "documentation",
      "bug",
    ]);
  });

  it("déduplique les labels", () => {
    const suggestions: LabelSuggestion[] = [
      { name: "bug", confidence: 0.95, reason: "first" },
      { name: "Bug", confidence: 0.85, reason: "duplicate" },
    ];

    const result = filterValidSuggestions(suggestions, repoLabels);
    expect(result).toHaveLength(1);
    expect(result[0].confidence).toBe(0.95);
  });

  it("est insensible à la casse pour le matching avec les labels du repo", () => {
    const suggestions: LabelSuggestion[] = [
      { name: "BUG", confidence: 0.85, reason: "" },
    ];

    const result = filterValidSuggestions(suggestions, repoLabels);
    expect(result).toHaveLength(1);
  });
});
