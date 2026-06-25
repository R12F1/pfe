import type { Context } from "probot";

type OctokitLike = Context<"check_run">["octokit"];

// Ajoute des labels à une PR (les labels GitHub sont des labels d'issue).
// N'effectue qu'un ajout : les labels existants de la PR ne sont pas retirés.
export async function applyLabels(
  octokit: OctokitLike,
  owner: string,
  repo: string,
  issueNumber: number,
  labels: string[],
): Promise<void> {
  if (labels.length === 0) return;
  await octokit.issues.addLabels({
    owner,
    repo,
    issue_number: issueNumber,
    labels,
  });
}

// Retire des labels d'une PR, un par un (l'API ne supprime qu'un label à la fois).
export async function removeLabels(
  octokit: OctokitLike,
  owner: string,
  repo: string,
  issueNumber: number,
  labels: string[],
): Promise<void> {
  for (const name of labels) {
    await octokit.issues.removeLabel({
      owner,
      repo,
      issue_number: issueNumber,
      name,
    });
  }
}

// Variante pratique pour l'event pull_request (conserve l'API existante).
export async function applyLabelsToPullRequest(
  context: Context<"pull_request">,
  issueNumber: number,
  labels: string[],
): Promise<void> {
  if (labels.length === 0) return;
  const { repository } = context.payload;
  const owner = repository.owner.login;
  const repo = repository.name;

  await applyLabels(context.octokit, owner, repo, issueNumber, labels);

  context.log.info(
    { owner, repo, issueNumber, labels },
    "Applied labels to pull request",
  );
}
