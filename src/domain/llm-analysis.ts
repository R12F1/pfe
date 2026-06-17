import type { LabelSuggestion } from "./label-suggestion.js";

// Réponse complète du LLM : labels suggérés + résumé.
export type PullRequestAnalysis = {
  suggestions: LabelSuggestion[];
  summary: string;
};
