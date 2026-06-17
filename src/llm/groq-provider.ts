import Groq from "groq-sdk";
import type { LlmProvider } from "./llm-provider.js";
import type { PullRequestData } from "../domain/pull-request-data.js";
import type { LabelSuggestion } from "../domain/label-suggestion.js";
import { buildClassificationPrompt } from "./prompt-builder.js";

export class GroqProvider implements LlmProvider {
  private client: Groq;
  private model: string;

  constructor(
    apiKey: string,
    model = "llama-3.1-8b-instant",
  ) {
    this.client = new Groq({ apiKey });
    this.model = model;
  }

  async classifyPullRequest(prData: PullRequestData): Promise<LabelSuggestion[]> {
    const prompt = buildClassificationPrompt(prData);

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 512,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as { suggestions?: LabelSuggestion[] };
    return parsed.suggestions ?? [];
  }
}
