import type { Context } from "probot";
import type {
  PullRequestData,
  PullRequestFileData,
} from "../domain/pull-request-data.js";

export async function readPullRequestData(
  context: Context<"pull_request">,
): Promise<PullRequestData> {
  const { pull_request: pr, repository } = context.payload;
  const owner = repository.owner.login;
  const repo = repository.name;
  const pullNumber = pr.number;

  const filesResponse = await context.octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: pullNumber,
    per_page: 100,
  });

  const labelsResponse = await context.octokit.issues.listLabelsForRepo({
    owner,
    repo,
    per_page: 100,
  });

  const files: PullRequestFileData[] = filesResponse.data.map((file) => ({
    filename: file.filename,
    status: file.status,
    additions: file.additions,
    deletions: file.deletions,
    changes: file.changes,
    patch: file.patch,
  }));

  const repositoryLabels = labelsResponse.data.map((label) => label.name);

  return {
    owner,
    repo,
    number: pullNumber,
    title: pr.title,
    body: pr.body ?? "",
    author: pr.user?.login ?? "unknown",
    baseBranch: pr.base.ref,
    headBranch: pr.head.ref,
    htmlUrl: pr.html_url,
    additions: pr.additions ?? 0,
    deletions: pr.deletions ?? 0,
    changedFilesCount: pr.changed_files ?? files.length,
    files,
    repositoryLabels,
  };
}
