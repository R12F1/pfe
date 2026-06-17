import type { PullRequestData } from "../domain/pull-request-data.js";
import type { LabelSuggestion } from "../domain/label-suggestion.js";
import {
  BOT_COMMENT_MARKER,
  MAX_FILES_IN_COMMENT,
} from "../utils/constants.js";

export function buildAnalysisComment(
  prData: PullRequestData,
  suggestions: LabelSuggestion[] = [],
): string {
  const visibleFiles = prData.files.slice(0, MAX_FILES_IN_COMMENT);

  const filesList =
    visibleFiles.length > 0
      ? visibleFiles
          .map(
            (file) =>
              `- \`${file.filename}\` (${file.status}, +${file.additions}/-${file.deletions})`,
          )
          .join("\n")
      : "_Aucun fichier détecté._";

  const hiddenFilesCount = prData.files.length - visibleFiles.length;
  const hiddenFilesText =
    hiddenFilesCount > 0
      ? `\n\n_... et ${hiddenFilesCount} autre(s) fichier(s)._`
      : "";

  const suggestionsSection =
    suggestions.length > 0
      ? suggestions
          .map(
            (s) =>
              `| \`${s.name}\` | ${Math.round(s.confidence * 100)}% | ${s.reason} |`,
          )
          .join("\n")
      : null;

  const labelsSection = suggestionsSection
    ? `### 🏷️ Labels suggérés par le LLM

| Label | Confiance | Raison |
|---|---|---|
${suggestionsSection}`
    : `### Labels disponibles dans le repo

${
  prData.repositoryLabels.length > 0
    ? prData.repositoryLabels.map((label) => `\`${label}\``).join(", ")
    : "_Aucun label trouvé dans le repo._"
}

> ⚠️ Aucune suggestion LLM disponible pour cette PR.`;

  return `${BOT_COMMENT_MARKER}
## 🤖 LLM PR Labeler — Analyse préliminaire

L'application a bien reçu et analysé cette Pull Request.

| Champ | Valeur |
|---|---|
| PR | #${prData.number} |
| Titre | ${escapeMarkdownTableValue(prData.title)} |
| Auteur | \`${prData.author}\` |
| Branche source | \`${prData.headBranch}\` |
| Branche cible | \`${prData.baseBranch}\` |
| Changements | +${prData.additions} / -${prData.deletions} |
| Fichiers modifiés | ${prData.changedFilesCount} |

### Fichiers détectés

${filesList}${hiddenFilesText}

${labelsSection}
`;
}

function escapeMarkdownTableValue(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}
