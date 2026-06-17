import type { Context } from "probot";
import { readPullRequestData } from "../github/pr-reader.js";
import { buildAnalysisComment } from "../comments/build-analysis-comment.js";
import { upsertPullRequestComment } from "../github/pr-commenter.js";
import { GroqProvider } from "../llm/groq-provider.js";
import { buildPullRequestLlmContext } from "../llm/pr-context.js";
import { filterValidSuggestions } from "../labels/label-policy.js";
import type { PullRequestAnalysis } from "../domain/llm-analysis.js";

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

    // Préparation intelligente : on score/filtre les fichiers avant l'appel LLM.
    const llmContext = buildPullRequestLlmContext(prData);
    context.log.info(
      {
        ...logContext,
        selectedFiles: llmContext.selectedFilesCount,
        ignoredFiles: llmContext.ignoredFilesCount,
      },
      "Filtered LLM context built",
    );

    let analysis: PullRequestAnalysis | null = null;
    const groq = createGroqProvider();

    if (groq) {
      try {
        const raw = await groq.classifyPullRequest(llmContext);
        analysis = {
          ...raw,
          suggestions: filterValidSuggestions(
            raw.suggestions,
            prData.repositoryLabels,
          ),
        };
        context.log.info(
          {
            ...logContext,
            suggestions: analysis.suggestions.map((s) => s.name),
          },
          "LLM label suggestions generated",
        );
      } catch (llmError) {
        context.log.warn(
          {
            ...logContext,
            error: llmError instanceof Error ? llmError.message : llmError,
          },
          "LLM call failed, posting comment without suggestions",
        );
      }
    } else {
      context.log.warn(
        logContext,
        "GROQ_API_KEY not configured, skipping LLM classification",
      );
    }

    const commentBody = buildAnalysisComment(prData, llmContext, analysis);
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
