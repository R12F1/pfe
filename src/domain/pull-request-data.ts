export type PullRequestFileData = {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
};

export type PullRequestData = {
  owner: string;
  repo: string;
  number: number;
  title: string;
  body: string;
  author: string;
  baseBranch: string;
  headBranch: string;
  htmlUrl: string;
  additions: number;
  deletions: number;
  changedFilesCount: number;
  files: PullRequestFileData[];
  repositoryLabels: string[];
};
