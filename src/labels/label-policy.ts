import type { LabelSuggestion } from "../domain/label-suggestion.js";

export function filterValidSuggestions(
  suggestions: LabelSuggestion[],
  repositoryLabels: string[],
  minConfidence = 0.7,
  maxLabels = 3,
): LabelSuggestion[] {
  const repoLabelsLower = new Set(
    repositoryLabels.map((label) => label.toLowerCase()),
  );
  const seen = new Set<string>();

  return suggestions
    .filter((suggestion) => suggestion.confidence >= minConfidence)
    .filter((suggestion) => repoLabelsLower.has(suggestion.name.toLowerCase()))
    .filter((suggestion) => {
      const key = suggestion.name.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, maxLabels);
}
