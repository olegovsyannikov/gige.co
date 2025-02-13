import { OpenAIConfig } from "@/types/matching";
import OpenAI from "openai";

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMResponse<T = unknown> {
  content: string;
  structured?: T;
}

export interface LLMClient {
  chat: <T = unknown>(
    messages: LLMMessage[],
    config?: Partial<OpenAIConfig>,
    responseFormat?: { type: "json_object" }
  ) => Promise<LLMResponse<T>>;
}

// OpenAI implementation
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 1
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        // Wait for 1 second before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }
    }
  }

  throw lastError;
}

export const openaiClient: LLMClient = {
  async chat<T>(
    messages: LLMMessage[],
    config: Partial<OpenAIConfig> = {},
    responseFormat?: { type: "json_object" }
  ) {
    const completion = await retryOperation(async () => {
      const response = await openai.chat.completions.create({
        model: config.model || "gpt-4-turbo-preview",
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 1000,
        messages,
        response_format: responseFormat,
      });
      return response;
    });

    const content = completion.choices[0].message.content || "";

    return {
      content,
      ...(responseFormat && { structured: JSON.parse(content) as T }),
    };
  },
};
