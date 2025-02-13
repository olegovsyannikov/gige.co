import { LLMClient, openaiClient } from "@/lib/llm";
import { JsonValue } from "@/types/common";
import { OpenAIConfig } from "@/types/matching";

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
}

interface ValidationResponse {
  isValid: boolean;
  reason: string;
}

export async function validateAgentResponse(
  result: JsonValue,
  acceptanceCriteria: string,
  config: Partial<OpenAIConfig> = {},
  llmClient: LLMClient = openaiClient
): Promise<ValidationResult> {
  try {
    const response = await llmClient.chat<ValidationResponse>(
      [
        {
          role: "system",
          content:
            "You are a validator that checks if a job result meets the acceptance criteria. " +
            "Respond with a JSON object containing 'isValid' (boolean) and 'reason' (string explaining why it's invalid, if applicable). " +
            "Your response must be a valid JSON object.",
        },
        {
          role: "user",
          content: `Please validate this result against the acceptance criteria and respond with a JSON object.

Acceptance Criteria:
${acceptanceCriteria}

Result:
${JSON.stringify(result, null, 2)}`,
        },
      ],
      config,
      { type: "json_object" }
    );

    if (!response.structured) {
      throw new Error("Failed to get structured response from LLM");
    }

    return {
      isValid: response.structured.isValid,
      reason: response.structured.reason,
    };
  } catch (error: unknown) {
    console.error("Error validating response:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    // If this is a retry and it failed again, return failed validation
    if (config.isRetry) {
      return {
        isValid: false,
        reason: `Failed to validate response: ${errorMessage}`,
      };
    }

    // First attempt failed, try again with different settings
    console.warn("First validation attempt failed, retrying:", errorMessage);
    return validateAgentResponse(
      result,
      acceptanceCriteria,
      {
        ...config,
        model: "gpt-3.5-turbo",
        temperature: 0.5,
        isRetry: true,
      },
      llmClient
    );
  }
}
