import type { LlmProvider } from "./llm-provider.js";
import type { PullRequestData } from "../domain/pull-request-data.js";
import type { LabelSuggestion } from "../domain/label-suggestion.js";

export class DummyLlmProvider implements LlmProvider {
  async classifyPullRequest(
    prData: PullRequestData,
  ): Promise<LabelSuggestion[]> {
    const suggestions: LabelSuggestion[] = [];
    const files = prData.files.map((file) => file.filename.toLowerCase());
    const title = prData.title.toLowerCase();

    if (title.includes("fix") || title.includes("bug")) {
      suggestions.push({
        name: "bug",
        confidence: 0.85,
        reason: "Le titre semble indiquer une correction de bug.",
      });
    }

    if (files.some((file) => file.includes("test") || file.includes("spec"))) {
      suggestions.push({
        name: "tests",
        confidence: 0.8,
        reason: "La PR modifie au moins un fichier de test.",
      });
    }

    if (files.some((file) => file.includes("readme") || file.includes("docs/"))) {
      suggestions.push({
        name: "documentation",
        confidence: 0.8,
        reason: "La PR modifie de la documentation.",
      });
    }

    return suggestions;
  }
}
