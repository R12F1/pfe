import type { Context } from "probot";
import { BOT_COMMENT_MARKER } from "../utils/constants.js";

type OctokitLike = Context<"check_run">["octokit"];

export type BotComment = { id: number; body: string };

// Retrouve le commentaire de l'app (identifié par son marker) sur une issue/PR.
export async function findBotComment(
  octokit: OctokitLike,
  owner: string,
  repo: string,
  issueNumber: number,
): Promise<BotComment | null> {
  const commentsResponse = await octokit.issues.listComments({
    owner,
    repo,
    issue_number: issueNumber,
    per_page: 100,
  });

  const existing = commentsResponse.data.find((comment) =>
    comment.body?.includes(BOT_COMMENT_MARKER),
  );

  return existing ? { id: existing.id, body: existing.body ?? "" } : null;
}

// Crée ou met à jour le commentaire de l'app (upsert via le marker).
export async function upsertComment(
  octokit: OctokitLike,
  owner: string,
  repo: string,
  issueNumber: number,
  body: string,
): Promise<void> {
  const existing = await findBotComment(octokit, owner, repo, issueNumber);

  if (existing) {
    await octokit.issues.updateComment({
      owner,
      repo,
      comment_id: existing.id,
      body,
    });
    return;
  }

  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body,
  });
}

// Variante pratique pour l'event pull_request (conserve l'API existante).
export async function upsertPullRequestComment(
  context: Context<"pull_request">,
  issueNumber: number,
  body: string,
): Promise<void> {
  const { repository } = context.payload;
  const owner = repository.owner.login;
  const repo = repository.name;

  const existing = await findBotComment(
    context.octokit,
    owner,
    repo,
    issueNumber,
  );

  if (existing) {
    await context.octokit.issues.updateComment({
      owner,
      repo,
      comment_id: existing.id,
      body,
    });
    context.log.info(
      { owner, repo, issueNumber, commentId: existing.id },
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

  context.log.info({ owner, repo, issueNumber }, "Created new bot comment");
}
