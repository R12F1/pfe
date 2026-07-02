import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleCheckRunRequestedAction } from "../src/handlers/check-run-handler.js";
import { renderAnalysisDataBlock } from "../src/comments/comment-state.js";
import { BOT_COMMENT_MARKER, AI_LABEL_MARKER_NAME } from "../src/utils/constants.js";
import { ACTION_APPLY_HIGH, ACTION_APPLY_ALL } from "../src/github/check-run.js";

const analysis = {
  suggestions: [
    { name: "feature", confidence: 0.95, reason: "nouvel endpoint" },
    { name: "bug", confidence: 0.72, reason: "corrige un cas limite" },
  ],
  summary: "Ajoute l'authentification JWT.",
};

function createMockContext(identifier: string, currentLabels: string[] = []) {
  const commentBody = `${BOT_COMMENT_MARKER}\n${renderAnalysisDataBlock(analysis)}`;

  return {
    payload: {
      requested_action: { identifier },
      check_run: {
        pull_requests: [{ number: 5 }],
      },
      repository: { owner: { login: "org" }, name: "repo" },
    },
    octokit: {
      pulls: {
        get: vi.fn().mockResolvedValue({
          data: {
            title: "Add JWT auth",
            body: "",
            user: { login: "talip" },
            base: { ref: "main" },
            head: { ref: "feat/jwt" },
            html_url: "",
            additions: 30,
            deletions: 2,
            changed_files: 1,
          },
        }),
        listFiles: vi.fn().mockResolvedValue({
          data: [
            {
              filename: "src/auth/jwt.ts",
              status: "added",
              additions: 30,
              deletions: 0,
              changes: 30,
            },
          ],
        }),
      },
      issues: {
        listLabelsForRepo: vi
          .fn()
          .mockResolvedValue({ data: [{ name: "feature" }, { name: "bug" }] }),
        listLabelsOnIssue: vi
          .fn()
          .mockResolvedValue({ data: currentLabels.map((name) => ({ name })) }),
        listComments: vi
          .fn()
          .mockResolvedValue({ data: [{ id: 1, body: commentBody }] }),
        updateComment: vi.fn().mockResolvedValue({}),
        createComment: vi.fn().mockResolvedValue({}),
        addLabels: vi.fn().mockResolvedValue({}),
        removeLabel: vi.fn().mockResolvedValue({}),
        createLabel: vi.fn().mockResolvedValue({}),
      },
    },
    log: {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    },
  };
}

describe("handleCheckRunRequestedAction — marqueur IA", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ajoute le marqueur IA quand Auto-apply all applique des labels", async () => {
    const ctx = createMockContext(ACTION_APPLY_ALL, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await handleCheckRunRequestedAction(ctx as any);

    expect(ctx.octokit.issues.addLabels).toHaveBeenCalledWith(
      expect.objectContaining({ labels: ["feature", "bug"] }),
    );
    expect(ctx.octokit.issues.addLabels).toHaveBeenCalledWith(
      expect.objectContaining({ labels: [AI_LABEL_MARKER_NAME] }),
    );
  });

  it("ajoute le marqueur IA et retire les labels sous le seuil en mode Auto-apply high", async () => {
    const ctx = createMockContext(ACTION_APPLY_HIGH, ["bug"]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await handleCheckRunRequestedAction(ctx as any);

    expect(ctx.octokit.issues.removeLabel).toHaveBeenCalledWith(
      expect.objectContaining({ name: "bug" }),
    );
    expect(ctx.octokit.issues.addLabels).toHaveBeenCalledWith(
      expect.objectContaining({ labels: ["feature"] }),
    );
    expect(ctx.octokit.issues.addLabels).toHaveBeenCalledWith(
      expect.objectContaining({ labels: [AI_LABEL_MARKER_NAME] }),
    );
  });

  it("retire le marqueur IA si Auto-apply high ne conserve plus aucun label suggéré", async () => {
    const ctx = createMockContext(ACTION_APPLY_HIGH, ["bug", AI_LABEL_MARKER_NAME]);
    ctx.octokit.issues.listLabelsForRepo = vi
      .fn()
      .mockResolvedValue({ data: [{ name: "bug" }] });

    // Seule "bug" (sous le seuil) est suggérée et présente : rien ne reste après retrait.
    const soloAnalysis = {
      suggestions: [{ name: "bug", confidence: 0.5, reason: "faible confiance" }],
      summary: "",
    };
    const commentBody = `${BOT_COMMENT_MARKER}\n${renderAnalysisDataBlock(soloAnalysis)}`;
    ctx.octokit.issues.listComments = vi
      .fn()
      .mockResolvedValue({ data: [{ id: 1, body: commentBody }] });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await handleCheckRunRequestedAction(ctx as any);

    expect(ctx.octokit.issues.removeLabel).toHaveBeenCalledWith(
      expect.objectContaining({ name: AI_LABEL_MARKER_NAME }),
    );
  });
});
