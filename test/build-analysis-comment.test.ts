import { describe, it, expect } from "vitest";
import { buildAnalysisComment } from "../src/comments/build-analysis-comment.js";
import type { PullRequestData } from "../src/domain/pull-request-data.js";
import { BOT_COMMENT_MARKER } from "../src/utils/constants.js";

const baseData: PullRequestData = {
  owner: "org",
  repo: "test-repo",
  number: 42,
  title: "Fix login bug",
  body: "",
  author: "mehdi",
  baseBranch: "main",
  headBranch: "fix-login",
  htmlUrl: "https://github.com/org/test-repo/pull/42",
  additions: 25,
  deletions: 5,
  changedFilesCount: 2,
  files: [
    {
      filename: "src/auth/login.ts",
      status: "modified",
      additions: 20,
      deletions: 5,
      changes: 25,
    },
    {
      filename: "test/auth/login.test.ts",
      status: "added",
      additions: 5,
      deletions: 0,
      changes: 5,
    },
  ],
  repositoryLabels: ["bug", "feature", "tests"],
};

describe("buildAnalysisComment", () => {
  it("inclut le marker pour permettre l'upsert", () => {
    const result = buildAnalysisComment(baseData);
    expect(result.startsWith(BOT_COMMENT_MARKER)).toBe(true);
  });

  it("affiche les infos de la PR dans le tableau", () => {
    const result = buildAnalysisComment(baseData);
    expect(result).toContain("#42");
    expect(result).toContain("Fix login bug");
    expect(result).toContain("mehdi");
    expect(result).toContain("+25 / -5");
  });

  it("liste tous les fichiers modifiés", () => {
    const result = buildAnalysisComment(baseData);
    expect(result).toContain("`src/auth/login.ts`");
    expect(result).toContain("`test/auth/login.test.ts`");
  });

  it("escape les caractères pipe dans le titre", () => {
    const data = { ...baseData, title: "Fix bug | edge case" };
    const result = buildAnalysisComment(data);
    expect(result).toContain("Fix bug \\| edge case");
  });

  it("affiche un message si le repo n'a pas de labels", () => {
    const data = { ...baseData, repositoryLabels: [] };
    const result = buildAnalysisComment(data);
    expect(result).toContain("Aucun label trouvé");
  });

  it("indique combien de fichiers sont cachés au-delà de la limite", () => {
    const manyFiles = Array.from({ length: 25 }, (_, i) => ({
      filename: `file${i}.ts`,
      status: "modified",
      additions: 1,
      deletions: 0,
      changes: 1,
    }));
    const data = { ...baseData, files: manyFiles };
    const result = buildAnalysisComment(data);
    expect(result).toContain("et 5 autre(s) fichier(s)");
  });
});
