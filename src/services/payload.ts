import { LLMClient, openaiClient } from "@/lib/llm";
import { JsonSchema } from "@/types/common";
import { OpenAIConfig } from "@/types/matching";

interface PayloadGenerationRequest {
  agentId: string;
  agentName: string;
  inputSchema: JsonSchema;
  userInputs: Record<string, unknown>;
  jobDescription: string;
  jobRequirements: string;
}

interface PayloadResponse {
  payload: JsonSchema;
  validationErrors?: string[];
}

function generatePayloadPrompt(request: PayloadGenerationRequest): string {
  const {
    agentName,
    inputSchema,
    userInputs,
    jobDescription,
    jobRequirements,
  } = request;

  return `Convert user inputs into a valid payload for the agent.

Agent: ${agentName}
Input Schema: ${JSON.stringify(inputSchema, null, 2)}

Job Context:
Description: ${jobDescription}
Requirements: ${jobRequirements}

User Provided Inputs:
${JSON.stringify(userInputs, null, 2)}

Generate a valid payload that:
1. Follows the agent's input schema exactly
2. Incorporates user inputs appropriately
3. Adds any missing required fields based on the job context

Response must be a JSON object with:
- payload: object (matching agent's input schema)
- validationErrors: array of strings (if any schema violations found)`;
}

export async function generatePayload(
  request: PayloadGenerationRequest,
  config: Partial<OpenAIConfig> = {},
  llmClient: LLMClient = openaiClient
): Promise<PayloadResponse> {
  const prompt = generatePayloadPrompt(request);

  try {
    const response = await llmClient.chat<PayloadResponse>(
      [
        {
          role: "system",
          content:
            "You are an expert in JSON Schema validation and payload generation. Your task is to convert user inputs into valid agent payloads.",
        },
        { role: "user", content: prompt },
      ],
      config,
      { type: "json_object" }
    );

    if (!response.structured) {
      throw new Error("Failed to get structured response from LLM");
    }

    return {
      payload: response.structured.payload,
      validationErrors: response.structured.validationErrors,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(`Failed to generate payload: ${errorMessage}`);
  }
}
