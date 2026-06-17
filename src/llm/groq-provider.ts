import Groq from "groq-sdk";
import type { PullRequestLlmContext } from "../domain/pull-request-data.js";
import type { LabelSuggestion } from "../domain/label-suggestion.js";
import type { PullRequestAnalysis } from "../domain/llm-analysis.js";
import { buildClassificationPrompt } from "./prompt-builder.js";

export class GroqProvider {
  private client: Groq;
  private model: string;

  constructor(apiKey: string, model = "llama-3.1-8b-instant") {
    this.client = new Groq({ apiKey });
    this.model = model;
  }

  async classifyPullRequest(
    context: PullRequestLlmContext,
  ): Promise<PullRequestAnalysis> {
    const prompt = buildClassificationPrompt(context);

    let response;
    try {
      response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 512,
        response_format: { type: "json_object" },
      });
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status === 413 || status === 429) {
        throw new Error(
          `Groq a rejeté la requête (${status}) : prompt trop volumineux ou limite TPM atteinte. ` +
            "Réduisez MAX_FILES_FOR_LLM / MAX_PATCH_LINES_PER_FILE dans src/utils/constants.ts.",
        );
      }
      throw err;
    }

    const content = response.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as {
      suggestions?: LabelSuggestion[];
      summary?: string;
    };

    return {
      suggestions: parsed.suggestions ?? [],
      summary: parsed.summary ?? "",
    };
  }
}
