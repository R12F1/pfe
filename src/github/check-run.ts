import type { Context } from "probot";
import { AUTO_APPLY_CONFIDENCE_THRESHOLD } from "../utils/constants.js";

export const CHECK_RUN_NAME = "LLM PR Labeler";

// Identifiants des 3 boutons d'action affichés dans la Check Run.
export const ACTION_SUGGEST = "suggest";
export const ACTION_APPLY_HIGH = "apply_high";
export const ACTION_APPLY_ALL = "apply_all";

// Crée une Check Run portant les 3 boutons (max autorisé par GitHub).
// Le clic sur un bouton déclenche l'event check_run.requested_action.
export async function createLabelerCheckRun(
  context: Context<"pull_request">,
  headSha: string,
  summary: string,
): Promise<void> {
  const { repository } = context.payload;
  const highPct = Math.round(AUTO_APPLY_CONFIDENCE_THRESHOLD * 100);

  await context.octokit.checks.create({
    owner: repository.owner.login,
    repo: repository.name,
    name: CHECK_RUN_NAME,
    head_sha: headSha,
    status: "completed",
    conclusion: "neutral",
    output: {
      title: "Suggestions de labels",
      summary,
    },
    actions: [
      {
        label: "Suggest only",
        identifier: ACTION_SUGGEST,
        description: "Choisir les labels manuellement",
      },
      {
        label: "Auto-apply high",
        identifier: ACTION_APPLY_HIGH,
        description: `Appliquer les labels >= ${highPct}%`,
      },
      {
        label: "Auto-apply all",
        identifier: ACTION_APPLY_ALL,
        description: "Appliquer tous les labels retenus",
      },
    ],
  });

  context.log.info(
    { owner: repository.owner.login, repo: repository.name, headSha },
    "Labeler check run created",
  );
}
