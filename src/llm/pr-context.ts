import type {
  PullRequestData,
  PullRequestLlmContext,
  RankedFileSummary,
  RankedPullRequestFile,
} from "../domain/pull-request-data.js";
import {
  MAX_ALL_FILES_SUMMARY,
  MAX_FILES_FOR_LLM,
} from "../utils/constants.js";
import { rankFilesByImportance } from "./file-selector.js";
import { truncateFilePatch } from "./patch-utils.js";

export function buildPullRequestLlmContext(
  prData: PullRequestData,
): PullRequestLlmContext {
  const ranked = rankFilesByImportance(prData.files);

  const ignoredFilesCount = ranked.filter((r) => r.ignored).length;

  // Fichiers retenus pour le LLM : non ignorés, les mieux scorés, patchs tronqués.
  const selectedFiles: RankedPullRequestFile[] = ranked
    .filter((r) => !r.ignored)
    .slice(0, MAX_FILES_FOR_LLM)
    .map((r) => ({
      ...r,
      file: truncateFilePatch(r.file),
    }));

  // Résumé global : tous les fichiers (sans patch), limité pour rester compact.
  const allFilesSummary: RankedFileSummary[] = ranked
    .slice(0, MAX_ALL_FILES_SUMMARY)
    .map((r) => ({
      filename: r.file.filename,
      status: r.file.status,
      changes: r.file.changes,
      score: r.score,
      ignored: r.ignored,
    }));

  return {
    repository: {
      owner: prData.owner,
      repo: prData.repo,
    },
    pullRequest: {
      number: prData.number,
      title: prData.title,
      body: prData.body,
      author: prData.author,
      baseBranch: prData.baseBranch,
      headBranch: prData.headBranch,
      htmlUrl: prData.htmlUrl,
    },
    totals: {
      additions: prData.additions,
      deletions: prData.deletions,
      changedFilesCount: prData.changedFilesCount,
    },
    repositoryLabels: prData.repositoryLabels,
    allFilesSummary,
    selectedFiles,
    ignoredFilesCount,
    selectedFilesCount: selectedFiles.length,
  };
}
