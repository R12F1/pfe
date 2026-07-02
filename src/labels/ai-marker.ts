import type { Context } from "probot";
import {
  AI_LABEL_MARKER_COLOR,
  AI_LABEL_MARKER_DESCRIPTION,
  AI_LABEL_MARKER_NAME,
} from "../utils/constants.js";
import { applyLabels, removeLabels } from "./label-applier.js";

type OctokitLike = Context<"check_run">["octokit"];

// GitHub ne permet pas d'ajouter une icône à côté d'un label existant.
// On matérialise donc l'origine "IA" par un label dédié, présent sur la PR
// tant qu'au moins un label suggéré par le LLM y est appliqué. Un label
// ajouté manuellement par un humain (hors suggestions) ne déclenche jamais
// ce marqueur : il n'apparaît que pour l'ensemble déjà listé dans le
// commentaire interactif.
async function ensureAiMarkerLabelExists(
  octokit: OctokitLike,
  owner: string,
  repo: string,
): Promise<void> {
  try {
    await octokit.issues.createLabel({
      owner,
      repo,
      name: AI_LABEL_MARKER_NAME,
      color: AI_LABEL_MARKER_COLOR,
      description: AI_LABEL_MARKER_DESCRIPTION,
    });
  } catch (error) {
    const status = (error as { status?: number } | undefined)?.status;
    // 422 = le label existe déjà sur le repo, ce n'est pas une erreur.
    if (status !== 422) throw error;
  }
}

// Ajoute ou retire le label marqueur selon qu'au moins un label suggéré par
// le LLM est effectivement appliqué sur la PR après le changement en cours.
export async function syncAiMarkerLabel(
  octokit: OctokitLike,
  owner: string,
  repo: string,
  issueNumber: number,
  suggestionNames: string[],
  labelsOnPrBeforeChange: string[],
  added: string[] = [],
  removed: string[] = [],
): Promise<void> {
  const suggestedSet = new Set(suggestionNames.map((n) => n.toLowerCase()));
  const removedSet = new Set(removed.map((n) => n.toLowerCase()));

  const finalLabels = new Set(
    labelsOnPrBeforeChange
      .filter((l) => !removedSet.has(l.toLowerCase()))
      .map((l) => l.toLowerCase()),
  );
  for (const label of added) finalLabels.add(label.toLowerCase());

  const hasAiLabelApplied = Array.from(finalLabels).some((l) =>
    suggestedSet.has(l),
  );
  const markerCurrentlyPresent = labelsOnPrBeforeChange.some(
    (l) => l.toLowerCase() === AI_LABEL_MARKER_NAME.toLowerCase(),
  );

  if (hasAiLabelApplied && !markerCurrentlyPresent) {
    await ensureAiMarkerLabelExists(octokit, owner, repo);
    await applyLabels(octokit, owner, repo, issueNumber, [
      AI_LABEL_MARKER_NAME,
    ]);
  } else if (!hasAiLabelApplied && markerCurrentlyPresent) {
    await removeLabels(octokit, owner, repo, issueNumber, [
      AI_LABEL_MARKER_NAME,
    ]);
  }
}
