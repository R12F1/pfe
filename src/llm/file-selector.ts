import type {
  PullRequestFileData,
  RankedPullRequestFile,
} from "../domain/pull-request-data.js";

// Fichiers générés / binaires dont le contenu n'apporte rien au LLM.
const IGNORED_BASENAMES = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lockb",
]);

const IGNORED_DIRECTORIES = [
  "dist/",
  "build/",
  "coverage/",
  ".next/",
  "node_modules/",
];

const IGNORED_EXTENSIONS = [
  ".min.js",
  ".min.css",
  ".map",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".webp",
  ".ico",
  ".zip",
  ".tar",
  ".gz",
  ".pdf",
];

function basename(filename: string): string {
  const parts = filename.split("/");
  return parts[parts.length - 1] ?? filename;
}

function matchesPathSegment(lowerName: string, segments: string[]): boolean {
  return segments.some(
    (segment) =>
      lowerName.startsWith(`${segment}/`) ||
      lowerName.includes(`/${segment}/`),
  );
}

export function shouldIgnoreFile(filename: string): boolean {
  const lower = filename.toLowerCase();

  if (IGNORED_BASENAMES.has(basename(lower))) return true;
  if (IGNORED_DIRECTORIES.some((dir) => lower.startsWith(dir) || lower.includes(`/${dir}`)))
    return true;
  if (IGNORED_EXTENSIONS.some((ext) => lower.endsWith(ext))) return true;

  return false;
}

type Evaluation = {
  score: number;
  reasons: string[];
  ignored: boolean;
};

function evaluateFile(file: PullRequestFileData): Evaluation {
  if (shouldIgnoreFile(file.filename)) {
    return {
      score: -100,
      reasons: ["ignored generated file"],
      ignored: true,
    };
  }

  const lower = file.filename.toLowerCase();
  const reasons: string[] = [];
  let score = 0;

  const add = (points: number, reason: string) => {
    score += points;
    reasons.push(reason);
  };

  // Points selon le chemin / type de fichier.
  if (matchesPathSegment(lower, ["src", "app", "server", "backend", "api"]))
    add(5, "source code path");

  if (
    matchesPathSegment(lower, ["test", "tests", "__tests__"]) ||
    lower.includes(".spec.") ||
    lower.includes(".test.")
  )
    add(3, "test file");

  if (lower.endsWith(".md") || basename(lower) === "readme.md" || matchesPathSegment(lower, ["docs"]))
    add(3, "documentation");

  if (lower.includes(".github/workflows/")) add(4, "CI/CD workflow");

  if (
    ["package.json", "pom.xml", "build.gradle", "requirements.txt", "pyproject.toml"].includes(
      basename(lower),
    )
  )
    add(4, "dependency/build manifest");

  if (["auth", "login", "jwt", "permission", "security"].some((kw) => lower.includes(kw)))
    add(4, "auth/security related");

  if (["cache", "perf", "performance", "benchmark", "latency"].some((kw) => lower.includes(kw)))
    add(3, "performance related");

  if (["db", "database", "migration", "schema", "prisma"].some((kw) => lower.includes(kw)))
    add(3, "database related");

  if (["config", "settings", "env"].some((kw) => lower.includes(kw)))
    add(2, "configuration related");

  // Points selon le statut du changement.
  switch (file.status) {
    case "added":
      add(2, "new file");
      break;
    case "renamed":
      add(2, "renamed file");
      break;
    case "modified":
      add(1, "modified file");
      break;
    case "removed":
      add(1, "removed file");
      break;
    default:
      break;
  }

  // Points selon la taille du changement.
  const changes = file.changes;
  if (changes >= 1 && changes <= 10) add(1, "small change size");
  else if (changes >= 11 && changes <= 200) add(2, "medium change size");
  else if (changes >= 201 && changes <= 800) add(1, "large change size");
  // > 800 changements : aucun point ajouté (changement trop massif).

  return { score, reasons, ignored: false };
}

export function scoreFile(file: PullRequestFileData): number {
  return evaluateFile(file).score;
}

export function rankFilesByImportance(
  files: PullRequestFileData[],
): RankedPullRequestFile[] {
  return files
    .map((file) => {
      const { score, reasons, ignored } = evaluateFile(file);
      return { file, score, reasons, ignored };
    })
    .sort((a, b) => b.score - a.score);
}
