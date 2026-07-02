import { describe, it, expect, vi, beforeEach } from "vitest";
import { syncAiMarkerLabel } from "../src/labels/ai-marker.js";
import { AI_LABEL_MARKER_NAME } from "../src/utils/constants.js";

function createOctokit() {
  return {
    issues: {
      createLabel: vi.fn().mockResolvedValue({}),
      addLabels: vi.fn().mockResolvedValue({}),
      removeLabel: vi.fn().mockResolvedValue({}),
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

describe("syncAiMarkerLabel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ajoute le label marqueur quand un label suggéré vient d'être appliqué", async () => {
    const octokit = createOctokit();
    await syncAiMarkerLabel(
      octokit,
      "org",
      "repo",
      1,
      ["bug", "feature"],
      [],
      ["bug"],
      [],
    );

    expect(octokit.issues.createLabel).toHaveBeenCalledWith(
      expect.objectContaining({ name: AI_LABEL_MARKER_NAME }),
    );
    expect(octokit.issues.addLabels).toHaveBeenCalledWith(
      expect.objectContaining({ labels: [AI_LABEL_MARKER_NAME] }),
    );
  });

  it("ne fait rien si le marqueur est déjà présent et qu'un label suggéré reste appliqué", async () => {
    const octokit = createOctokit();
    await syncAiMarkerLabel(
      octokit,
      "org",
      "repo",
      1,
      ["bug"],
      ["bug", AI_LABEL_MARKER_NAME],
      [],
      [],
    );

    expect(octokit.issues.addLabels).not.toHaveBeenCalled();
    expect(octokit.issues.removeLabel).not.toHaveBeenCalled();
  });

  it("retire le marqueur quand le dernier label suggéré est décoché", async () => {
    const octokit = createOctokit();
    await syncAiMarkerLabel(
      octokit,
      "org",
      "repo",
      1,
      ["bug"],
      ["bug", AI_LABEL_MARKER_NAME],
      [],
      ["bug"],
    );

    expect(octokit.issues.removeLabel).toHaveBeenCalledWith(
      expect.objectContaining({ name: AI_LABEL_MARKER_NAME }),
    );
  });

  it("ignore un label personnalisé ajouté manuellement (hors suggestions)", async () => {
    const octokit = createOctokit();
    await syncAiMarkerLabel(
      octokit,
      "org",
      "repo",
      1,
      ["bug"],
      [],
      ["priority-high"],
      [],
    );

    expect(octokit.issues.addLabels).not.toHaveBeenCalled();
    expect(octokit.issues.createLabel).not.toHaveBeenCalled();
  });

  it("ne recrée pas le label marqueur s'il existe déjà (erreur 422 ignorée)", async () => {
    const octokit = createOctokit();
    octokit.issues.createLabel = vi
      .fn()
      .mockRejectedValue({ status: 422 });

    await expect(
      syncAiMarkerLabel(octokit, "org", "repo", 1, ["bug"], [], ["bug"], []),
    ).resolves.not.toThrow();

    expect(octokit.issues.addLabels).toHaveBeenCalledWith(
      expect.objectContaining({ labels: [AI_LABEL_MARKER_NAME] }),
    );
  });
});
