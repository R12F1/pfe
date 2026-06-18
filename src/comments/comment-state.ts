import type { PullRequestAnalysis } from "../domain/llm-analysis.js";
import type { LabelSuggestion } from "../domain/label-suggestion.js";

// Bloc HTML invisible qui stocke l'analyse LLM de façon machine-readable,
// pour que les handlers (clic bouton, case cochée) puissent agir sans
// rappeler le LLM. Encodé en base64 pour rester robuste à tout texte.
const DATA_PREFIX = "<!-- llm-pr-labeler:data ";
const DATA_SUFFIX = " -->";
const DATA_REGEX = /<!-- llm-pr-labeler:data ([A-Za-z0-9+/=]+) -->/;

export function renderAnalysisDataBlock(analysis: PullRequestAnalysis): string {
  const json = JSON.stringify(analysis);
  const encoded = Buffer.from(json, "utf8").toString("base64");
  return `${DATA_PREFIX}${encoded}${DATA_SUFFIX}`;
}

export function parseAnalysisDataBlock(
  body: string,
): PullRequestAnalysis | null {
  const match = body.match(DATA_REGEX);
  if (!match) return null;
  try {
    const json = Buffer.from(match[1], "base64").toString("utf8");
    const parsed = JSON.parse(json) as PullRequestAnalysis;
    if (!Array.isArray(parsed.suggestions)) return null;
    return parsed;
  } catch {
    return null;
  }
}

// Rendu d'une ligne de case à cocher par label suggéré.
// Une case est cochée si le label fait partie de `checkedLabels`.
export function renderCheckboxLines(
  suggestions: LabelSuggestion[],
  checkedLabels: string[],
): string {
  const checked = new Set(checkedLabels.map((l) => l.toLowerCase()));
  return suggestions
    .map((s) => {
      const box = checked.has(s.name.toLowerCase()) ? "x" : " ";
      const pct = Math.round(s.confidence * 100);
      return `- [${box}] \`${s.name}\` — ${pct}% — ${s.reason}`;
    })
    .join("\n");
}

// Extrait les labels cochés (- [x]) du corps d'un commentaire.
export function parseCheckedLabels(body: string): string[] {
  const regex = /^- \[([ xX])\] `([^`]+)`/gm;
  const checked: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(body)) !== null) {
    if (match[1].toLowerCase() === "x") checked.push(match[2]);
  }
  return checked;
}

// Extrait tous les labels présents dans les cases (cochés ou non).
export function parseAllCheckboxLabels(body: string): string[] {
  const regex = /^- \[[ xX]\] `([^`]+)`/gm;
  const labels: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(body)) !== null) {
    labels.push(match[1]);
  }
  return labels;
}
