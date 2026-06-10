import type { PullRequestData } from "../domain/pull-request-data.js";
import type { LabelSuggestion } from "../domain/label-suggestion.js";

export interface LlmProvider {
  classifyPullRequest(prData: PullRequestData): Promise<LabelSuggestion[]>;
}
