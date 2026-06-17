import type { Context } from "probot";
import { readPullRequestData } from "../github/pr-reader.js";
import { buildAnalysisComment } from "../comments/build-analysis-comment.js";
import { upsertPullRequestComment } from "../github/pr-commenter.js";
import { GroqProvider } from "../llm/groq-provider.js";
import { filterValidSuggestions } from "../labels/label-policy.js";
import type { LabelSuggestion } from "../domain/label-suggestion.js";

function createGroqProvider(): GroqProvider | null {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";
  if (!apiKey || apiKey === "REMPLACER_PAR_VOTRE_CLE") return null;
  return new GroqProvider(apiKey, model);
}

export async function handlePullRequestEvent(
  context: Context<"pull_request">,
): Promise<void> {
  const { action, pull_request, repository } = context.payload;

  const logContext = {
    action,
    owner: repository.owner.login,
    repo: repository.name,
    pullNumber: pull_request.number,
  };

  context.log.info(logContext, "Processing pull request event");

  try {
    const prData = await readPullRequestData(context);

    let suggestions: LabelSuggestion[] = [];
    const groq = createGroqProvider();

    if (groq) {
      try {
        const raw = await groq.classifyPullRequest(prData);
        suggestions = filterValidSuggestions(raw, prData.repositoryLabels);
        context.log.info(
          { ...logContext, suggestions: suggestions.map((s) => s.name) },
          "LLM label suggestions generated",
        );
      } catch (llmError) {
        context.log.warn(
          { ...logContext, error: llmError instanceof Error ? llmError.message : llmError },
          "LLM call failed, posting comment without suggestions",
        );
      }
    } else {
      context.log.warn(logContext, "GROQ_API_KEY not configured, skipping LLM classification");
    }

    const commentBody = buildAnalysisComment(prData, suggestions);
    await upsertPullRequestComment(context, prData.number, commentBody);

    context.log.info(logContext, "Pull request analysis comment published");
  } catch (error) {
    context.log.error(
      {
        ...logContext,
        error: error instanceof Error ? error.message : error,
      },
      "Failed to process pull request event",
    );
  }
}
