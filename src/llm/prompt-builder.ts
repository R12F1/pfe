import type { PullRequestData } from "../domain/pull-request-data.js";
import { MAX_FILES_IN_COMMENT } from "../utils/constants.js";

export function buildClassificationPrompt(prData: PullRequestData): string {
  const visibleFiles = prData.files.slice(0, MAX_FILES_IN_COMMENT);

  const filesSection =
    visibleFiles.length > 0
      ? visibleFiles
          .map(
            (f) =>
              `- ${f.filename} (${f.status}, +${f.additions}/-${f.deletions})`,
          )
          .join("\n")
      : "Aucun fichier détecté.";

  const labelsSection =
    prData.repositoryLabels.length > 0
      ? prData.repositoryLabels.join(", ")
      : "Aucun label disponible.";

  return `Tu es un assistant spécialisé dans l'analyse de Pull Requests GitHub.
Ta tâche est de suggérer des labels pertinents pour la PR suivante.

## Données de la Pull Request

- Titre : ${prData.title}
- Auteur : ${prData.author}
- Branche source : ${prData.headBranch}
- Branche cible : ${prData.baseBranch}
- Description : ${prData.body || "(aucune description)"}
- Changements : +${prData.additions} / -${prData.deletions}

## Fichiers modifiés

${filesSection}

## Labels disponibles dans le repo

${labelsSection}

## Instructions

Analyse la PR et suggère entre 1 et 3 labels parmi ceux disponibles.
Pour chaque label suggéré, donne un score de confiance entre 0 et 1, et une courte raison.

Réponds UNIQUEMENT avec un objet JSON valide dans ce format exact :
{
  "suggestions": [
    { "name": "nom-du-label", "confidence": 0.9, "reason": "explication courte" }
  ]
}

Ne suggère que des labels qui existent dans la liste des labels disponibles.
Si aucun label ne correspond, retourne { "suggestions": [] }.`;
}
