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
  pullRequestLabels: string[];
};

// Fichier auquel on a attribué un score d'importance pour la sélection LLM.
export type RankedPullRequestFile = {
  file: PullRequestFileData;
  score: number;
  reasons: string[];
  ignored: boolean;
};

// Résumé léger (sans patch) d'un fichier, utilisé dans le contexte global.
export type RankedFileSummary = {
  filename: string;
  status: string;
  changes: number;
  score: number;
  ignored: boolean;
};

// Contexte compact et filtré, prêt à être envoyé au LLM.
export type PullRequestLlmContext = {
  repository: {
    owner: string;
    repo: string;
  };
  pullRequest: {
    number: number;
    title: string;
    body: string;
    author: string;
    baseBranch: string;
    headBranch: string;
    htmlUrl: string;
  };
  totals: {
    additions: number;
    deletions: number;
    changedFilesCount: number;
  };
  repositoryLabels: string[];
  allFilesSummary: RankedFileSummary[];
  selectedFiles: RankedPullRequestFile[];
  ignoredFilesCount: number;
  selectedFilesCount: number;
};
