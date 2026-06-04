import type { Context } from "probot";
import { BOT_COMMENT_MARKER } from "../utils/constants.js";

export async function upsertPullRequestComment(
  context: Context<"pull_request">,
  issueNumber: number,
  body: string,
): Promise<void> {
  const { repository } = context.payload;
  const owner = repository.owner.login;
  const repo = repository.name;

  const commentsResponse = await context.octokit.issues.listComments({
    owner,
    repo,
    issue_number: issueNumber,
    per_page: 100,
  });

  const existingBotComment = commentsResponse.data.find((comment) =>
    comment.body?.includes(BOT_COMMENT_MARKER),
  );

  if (existingBotComment) {
    await context.octokit.issues.updateComment({
      owner,
      repo,
      comment_id: existingBotComment.id,
      body,
    });

    context.log.info(
      { owner, repo, issueNumber, commentId: existingBotComment.id },
      "Updated existing bot comment",
    );
    return;
  }

  await context.octokit.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body,
  });

  context.log.info(
    { owner, repo, issueNumber },
    "Created new bot comment",
  );
}
