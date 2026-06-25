import { describe, it, expect } from "vitest";
import {
  shouldIgnoreFile,
  scoreFile,
  rankFilesByImportance,
} from "../src/llm/file-selector.js";
import type { PullRequestFileData } from "../src/domain/pull-request-data.js";

function file(
  filename: string,
  overrides: Partial<PullRequestFileData> = {},
): PullRequestFileData {
  return {
    filename,
    status: "modified",
    additions: 5,
    deletions: 0,
    changes: 5,
    ...overrides,
  };
}

describe("shouldIgnoreFile", () => {
  it("ignore les lockfiles", () => {
    expect(shouldIgnoreFile("package-lock.json")).toBe(true);
  });

  it("ignore les fichiers dans dist/", () => {
    expect(shouldIgnoreFile("dist/bundle.js")).toBe(true);
  });

  it("ignore les images", () => {
    expect(shouldIgnoreFile("image.png")).toBe(true);
  });

  it("ignore les fichiers minifiés", () => {
    expect(shouldIgnoreFile("file.min.js")).toBe(true);
  });

  it("ignore les source maps", () => {
    expect(shouldIgnoreFile("file.map")).toBe(true);
  });

  it("ne pas ignorer le code source", () => {
    expect(shouldIgnoreFile("src/auth/login.ts")).toBe(false);
  });

  it("ne pas ignorer les fichiers de test", () => {
    expect(shouldIgnoreFile("tests/login.spec.ts")).toBe(false);
  });

  it("ne pas ignorer le README", () => {
    expect(shouldIgnoreFile("README.md")).toBe(false);
  });
});

describe("scoreFile / rankFilesByImportance", () => {
  it("score un fichier source auth plus haut qu'un README normal", () => {
    const source = scoreFile(file("src/auth/login.ts"));
    const readme = scoreFile(file("README.md"));
    expect(source).toBeGreaterThan(readme);
  });

  it("donne un score pertinent à un workflow CI/CD", () => {
    const ranked = rankFilesByImportance([file(".github/workflows/ci.yml")]);
    expect(ranked[0].score).toBeGreaterThan(0);
    expect(ranked[0].reasons).toContain("CI/CD workflow");
  });

  it("marque les fichiers ignorés avec un score négatif", () => {
    const ranked = rankFilesByImportance([file("package-lock.json")]);
    expect(ranked[0].ignored).toBe(true);
    expect(ranked[0].score).toBeLessThan(0);
  });

  it("trie les fichiers par score décroissant", () => {
    const ranked = rankFilesByImportance([
      file("README.md"),
      file("src/auth/login.ts"),
      file("package-lock.json"),
    ]);
    const scores = ranked.map((r) => r.score);
    const sorted = [...scores].sort((a, b) => b - a);
    expect(scores).toEqual(sorted);
    expect(ranked[0].file.filename).toBe("src/auth/login.ts");
  });
});
