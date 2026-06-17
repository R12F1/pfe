import type { PullRequestFileData } from "../domain/pull-request-data.js";
import { MAX_PATCH_LINES_PER_FILE } from "../utils/constants.js";

export function truncatePatch(
  patch: string | undefined,
  maxLines: number,
): string | undefined {
  if (patch === undefined) return undefined;

  const lines = patch.split("\n");
  if (lines.length <= maxLines) return patch;

  const kept = lines.slice(0, maxLines);
  const remaining = lines.length - maxLines;
  return `${kept.join("\n")}\n... (${remaining} more lines truncated)`;
}

export function truncateFilePatch(
  file: PullRequestFileData,
  maxLines: number = MAX_PATCH_LINES_PER_FILE,
): PullRequestFileData {
  return { ...file, patch: truncatePatch(file.patch, maxLines) };
}
