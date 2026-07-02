import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleIssueCommentEdited } from "../src/handlers/comment-handler.js";
import { BOT_COMMENT_MARKER, AI_LABEL_MARKER_NAME } from "../src/utils/constants.js";

function buildCommentBody(checked: string[], all: string[]): string {
  const lines = all
    .map((name) => `- [${checked.includes(name) ? "x" : " "}] \`${name}\` — 90% — raison`)
    .join("\n");
  return `${BOT_COMMENT_MARKER}\n${lines}`;
}

function createMockContext(body: string, currentLabels: string[]) {
  return {
    payload: {
      comment: { body },
      issue: {
        number: 3,
        pull_request: {},
        labels: currentLabels.map((name) => ({ name })),
      },
      sender: { type: "User" },
      repository: { owner: { login: "org" }, name: "repo" },
    },
    octokit: {
      issues: {
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

describe("handleIssueCommentEdited — marqueur IA", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ajoute le marqueur IA quand une case suggérée est cochée", async () => {
    const body = buildCommentBody(["bug"], ["bug", "feature"]);
    const ctx = createMockContext(body, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await handleIssueCommentEdited(ctx as any);

    expect(ctx.octokit.issues.addLabels).toHaveBeenCalledWith(
      expect.objectContaining({ labels: ["bug"] }),
    );
    expect(ctx.octokit.issues.addLabels).toHaveBeenCalledWith(
      expect.objectContaining({ labels: [AI_LABEL_MARKER_NAME] }),
    );
  });

  it("retire le marqueur IA quand la dernière case suggérée est décochée", async () => {
    const body = buildCommentBody([], ["bug", "feature"]);
    const ctx = createMockContext(body, ["bug", AI_LABEL_MARKER_NAME]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await handleIssueCommentEdited(ctx as any);

    expect(ctx.octokit.issues.removeLabel).toHaveBeenCalledWith(
      expect.objectContaining({ name: "bug" }),
    );
    expect(ctx.octokit.issues.removeLabel).toHaveBeenCalledWith(
      expect.objectContaining({ name: AI_LABEL_MARKER_NAME }),
    );
  });

  it("ignore les éditions faites par le bot (anti-boucle)", async () => {
    const body = buildCommentBody(["bug"], ["bug"]);
    const ctx = createMockContext(body, []);
    ctx.payload.sender.type = "Bot";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await handleIssueCommentEdited(ctx as any);

    expect(ctx.octokit.issues.addLabels).not.toHaveBeenCalled();
  });
});
