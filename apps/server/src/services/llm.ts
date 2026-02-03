import { createOpenAI } from "@ai-sdk/openai";
import { env } from "@ocrbase/env/server";
import { generateText } from "ai";

const DEFAULT_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "google/gemini-2.5-flash";

const llmProvider = createOpenAI({
  apiKey: env.OPENROUTER_API_KEY ?? "ollama",
  baseURL: env.LLM_BASE_URL ?? DEFAULT_BASE_URL,
});

const getModel = () => env.LLM_MODEL ?? DEFAULT_MODEL;

interface ProcessExtractionOptions {
  markdown: string;
  schema?: Record<string, unknown>;
  hints?: string;
}

export interface LlmUsage {
  promptTokens: number;
  completionTokens: number;
}

interface ExtractionResult {
  data: Record<string, unknown>;
  usage: LlmUsage;
  model: string;
}

interface GenerateSchemaOptions {
  markdown: string;
  hints?: string;
}

interface GeneratedSchema {
  name: string;
  description: string;
  jsonSchema: Record<string, unknown>;
}

export const checkLlmHealth = async (): Promise<boolean> => {
  const baseUrl = env.LLM_BASE_URL ?? DEFAULT_BASE_URL;

  // If no API key and using OpenRouter, skip health check
  if (!env.OPENROUTER_API_KEY && !env.LLM_BASE_URL) {
    return true;
  }

  try {
    const response = await fetch(`${baseUrl}/models`, {
      headers: env.OPENROUTER_API_KEY
        ? { Authorization: `Bearer ${env.OPENROUTER_API_KEY}` }
        : {},
    });
    return response.ok;
  } catch {
    return false;
  }
};

const extractJsonFromResponse = <T>(text: string): T => {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const jsonStr = codeBlockMatch ? codeBlockMatch[1] : text;

  if (!jsonStr) {
    throw new Error("No JSON content found in response");
  }

  const trimmed = jsonStr.trim();
  const jsonStart = trimmed.indexOf("{");
  const jsonEnd = trimmed.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("No valid JSON object found in response");
  }

  const parsed = JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1)) as T;
  return parsed;
};

export const llmService = {
  async generateSchema({
    markdown,
    hints,
  }: GenerateSchemaOptions): Promise<GeneratedSchema> {
    if (!env.OPENROUTER_API_KEY && !env.LLM_BASE_URL) {
      throw new Error(
        "LLM is not configured (set OPENROUTER_API_KEY or LLM_BASE_URL)"
      );
    }

    let systemPrompt = `You are a JSON schema generator. Analyze the provided document and generate a JSON schema that can be used to extract structured data from similar documents.

Return ONLY a valid JSON object with this exact structure:
{
  "name": "A descriptive name for this schema",
  "description": "Description of what this schema extracts",
  "jsonSchema": { ... the JSON Schema definition ... }
}

Do not include any markdown formatting or explanation. Just the JSON object.`;

    if (hints) {
      systemPrompt += `\n\nFocus on extracting: ${hints}`;
    }

    const result = await generateText({
      model: llmProvider(getModel()),
      prompt: markdown,
      system: systemPrompt,
    });

    return extractJsonFromResponse<GeneratedSchema>(result.text);
  },

  async processExtraction({
    markdown,
    schema,
    hints,
  }: ProcessExtractionOptions): Promise<ExtractionResult> {
    if (!env.OPENROUTER_API_KEY && !env.LLM_BASE_URL) {
      throw new Error(
        "LLM is not configured (set OPENROUTER_API_KEY or LLM_BASE_URL)"
      );
    }

    let systemPrompt =
      "You are a data extraction assistant. Extract structured data from the provided markdown content. Return ONLY valid JSON, no markdown formatting or explanation.";

    if (hints) {
      systemPrompt += `\n\nFocus on extracting: ${hints}`;
    }

    if (schema) {
      systemPrompt += `\n\nFollow this JSON schema:\n${JSON.stringify(schema, null, 2)}`;
    }

    const model = getModel();
    const result = await generateText({
      model: llmProvider(model),
      prompt: markdown,
      system: systemPrompt,
    });

    return {
      data: extractJsonFromResponse<Record<string, unknown>>(result.text),
      model,
      usage: {
        completionTokens: result.usage.outputTokens ?? 0,
        promptTokens: result.usage.inputTokens ?? 0,
      },
    };
  },
};
