import type { Context } from "probot";
import { readPullRequestData } from "../github/pr-reader.js";
import { buildAnalysisComment } from "../comments/build-analysis-comment.js";
import { upsertPullRequestComment } from "../github/pr-commenter.js";

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
    const commentBody = buildAnalysisComment(prData);
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
    // On ne re-throw PAS pour éviter que GitHub réessaie indéfiniment
  }
}
