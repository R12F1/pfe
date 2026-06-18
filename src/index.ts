import type { Probot } from "probot";
import { handlePullRequestEvent } from "./handlers/pull-request-handler.js";
import { handleCheckRunRequestedAction } from "./handlers/check-run-handler.js";
import { handleIssueCommentEdited } from "./handlers/comment-handler.js";

export default (app: Probot) => {
  app.on(
    ["pull_request.opened", "pull_request.synchronize", "pull_request.edited"],
    async (context) => {
      await handlePullRequestEvent(context);
    },
  );

  app.on("check_run.requested_action", async (context) => {
    await handleCheckRunRequestedAction(context);
  });

  app.on("issue_comment.edited", async (context) => {
    await handleIssueCommentEdited(context);
  });

  app.log.info("LLM PR Labeler app loaded");
};
