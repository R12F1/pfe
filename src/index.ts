import type { Probot } from "probot";
import { handlePullRequestEvent } from "./handlers/pull-request-handler.js";

export default (app: Probot) => {
  app.on(
    ["pull_request.opened", "pull_request.synchronize", "pull_request.edited"],
    async (context) => {
      await handlePullRequestEvent(context);
    },
  );

  app.log.info("LLM PR Labeler app loaded");
};
