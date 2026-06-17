import type { PullRequestLlmContext } from "../domain/pull-request-data.js";

export function buildClassificationPrompt(
  context: PullRequestLlmContext,
): string {
  const { pullRequest, totals, repository } = context;
  const project = `${repository.owner}/${repository.repo}`;

  const labelsSection =
    context.repositoryLabels.length > 0
      ? context.repositoryLabels.join(", ")
      : "No labels available.";

  const allFilesSection =
    context.allFilesSummary.length > 0
      ? context.allFilesSummary
          .map(
            (f) =>
              `- ${f.filename} (${f.status}, ${f.changes} changes, score ${f.score}${f.ignored ? ", ignored" : ""})`,
          )
          .join("\n")
      : "_No files detected._";

  const selectedDiffsSection =
    context.selectedFiles.length > 0
      ? context.selectedFiles
          .map((ranked) => {
            const f = ranked.file;
            const patch = f.patch
              ? `\`\`\`diff\n${f.patch}\n\`\`\``
              : "_diff not available_";
            return `### ${f.filename} (${f.status}, +${f.additions}/-${f.deletions}, score ${ranked.score})\n${patch}`;
          })
          .join("\n\n")
      : "_No representative files selected._";

  return `You are a senior code reviewer and expert developer specializing in ${project}. You have deep knowledge of this codebase and understand its architecture, conventions, and typical change patterns.

Your task: Analyze this GitHub Pull Request and assign the most appropriate labels from the repository's label set.

## Pull Request to Analyze

**Repository:** ${project}
**PR #${pullRequest.number}:** ${pullRequest.title}
**Author:** ${pullRequest.author}
**Branch:** ${pullRequest.headBranch} → ${pullRequest.baseBranch}
**Description:** ${pullRequest.body || "(no description provided)"}

**Statistics:** ${totals.changedFilesCount} files changed (+${totals.additions}/-${totals.deletions}), ${context.selectedFilesCount} analyzed, ${context.ignoredFilesCount} ignored

## Files Changed

${allFilesSection}

## Code Diffs (most relevant files)

${selectedDiffsSection}

## Available Labels

You MUST only use labels from this list (use exact spelling):
${labelsSection}

## Analysis Instructions

Think step by step:
1. **Identify the primary intent**: What is this PR trying to accomplish? (fix a bug, add a feature, refactor, update docs, etc.)
2. **Examine the code changes**: Do the diffs confirm or contradict the title/description?
3. **Match to labels**: Which available labels best describe this change? Focus on the PRIMARY purpose.

Classification guidance:
- Bug fix: Code corrects incorrect behavior, handles edge cases, fixes crashes/errors
- Feature: Code adds NEW functionality or significantly extends existing capabilities  
- Refactor: Code restructures without changing external behavior (rename, extract, simplify)
- Test: Changes primarily add or modify test files
- Documentation: Changes primarily affect docs, README, comments
- CI/CD: Changes to workflows, build scripts, deployment configs

## Confidence Calibration

- **0.9-1.0**: Very confident — title, description, and code all clearly indicate this label
- **0.7-0.89**: Confident — strong evidence from code, minor ambiguity
- **0.5-0.69**: Moderate — reasonable inference, but context is limited
- **Below 0.5**: Do not suggest — insufficient evidence

## Output Format

Respond with ONLY this JSON (no markdown, no explanation outside JSON):
{
  "suggestions": [
    {"name": "bug", "confidence": 0.92, "reason": "Fixes null pointer exception in auth flow"}
  ],
  "summary": "One sentence describing what this PR does."
}

## Critical Rules

- Use EXACT label names from the available list (case-sensitive, include prefixes like "Type:" if present)
- Maximum 3 labels, sorted by confidence descending
- Focus on PRIMARY intent — do not over-label
- If no label fits with confidence ≥ 0.5, return empty suggestions array
- Keep reasons under 15 words
- Summary must be one clear sentence`;
}
