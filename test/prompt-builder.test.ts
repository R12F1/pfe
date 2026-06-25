import { describe, it, expect } from "vitest";
import { buildClassificationPrompt } from "../src/llm/prompt-builder.js";
import { buildPullRequestLlmContext } from "../src/llm/pr-context.js";
import type { PullRequestData } from "../src/domain/pull-request-data.js";

const prData: PullRequestData = {
  owner: "org",
  repo: "repo",
  number: 12,
  title: "Add JWT authentication",
  body: "Implements token-based auth",
  author: "talip",
  baseBranch: "main",
  headBranch: "feat/jwt",
  htmlUrl: "https://github.com/org/repo/pull/12",
  additions: 40,
  deletions: 3,
  changedFilesCount: 2,
  files: [
    {
      filename: "src/auth/jwt.ts",
      status: "added",
      additions: 40,
      deletions: 0,
      changes: 40,
      patch: "@@ +1,3 @@\n+export function sign() {}",
    },
    {
      filename: "package-lock.json",
      status: "modified",
      additions: 500,
      deletions: 0,
      changes: 500,
      patch: "@@ huge lockfile diff @@",
    },
  ],
  repositoryLabels: ["bug", "feature", "security"],
  pullRequestLabels: [],
};

describe("buildClassificationPrompt", () => {
  const prompt = buildClassificationPrompt(buildPullRequestLlmContext(prData));

  it("contient le titre de la PR", () => {
    expect(prompt).toContain("Add JWT authentication");
  });

  it("contient les labels disponibles", () => {
    expect(prompt).toContain("bug, feature, security");
  });

  it("contient le diff des fichiers sélectionnés", () => {
    expect(prompt).toContain("src/auth/jwt.ts");
    expect(prompt).toContain("export function sign()");
  });

  it("n'inclut pas le diff des fichiers ignorés (lockfile)", () => {
    expect(prompt).not.toContain("huge lockfile diff");
  });

  it("demande une réponse JSON stricte avec suggestions et summary", () => {
    expect(prompt).toContain('"suggestions"');
    expect(prompt).toContain('"summary"');
  });
});
