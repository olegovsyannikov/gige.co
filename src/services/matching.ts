import { LLMClient, openaiClient } from "@/lib/llm";
import { JsonSchema } from "@/types/common";
import {
  MatchingRequest,
  MatchingResult,
  OpenAIConfig,
} from "../types/matching";

interface AgentSummary {
  id: string;
  name: string;
  keywords: string[];
  description: string;
  capabilities: {
    input: JsonSchema;
    output: JsonSchema;
  };
}

interface MatchResponse {
  agentId: string;
  confidence: number;
  reasoning: string;
  requestPayload: JsonSchema | null;
}

function generateMatchingPrompt(request: MatchingRequest): string {
  const { job, availableAgents } = request;

  // Create concise agent summaries
  const agentSummaries: AgentSummary[] = availableAgents.map((agent) => ({
    id: agent.id,
    name: agent.name,
    keywords: agent.keywords.split(",").map((k) => k.trim()),
    description: agent.description,
    capabilities: {
      input: agent.inputSchema as JsonSchema,
      output: agent.outputSchema as JsonSchema,
    },
  }));

  return `Find the best agent for this job and generate input payload.

Job:
Title: ${job.name}
Description: ${job.description}
Requirements: ${job.acceptanceCriteria}

Available Agents:
${JSON.stringify(agentSummaries, null, 2)}

Analyze the job requirements and agent capabilities to:
1. Find the best matching agent
2. Generate a valid input payload according to the agent's input schema
3. Provide confidence score and reasoning

Response must be a JSON object with:
- agentId: string (agent's ID or empty string if no match)
- confidence: number (0-1)
- reasoning: string (explanation)
- requestPayload: object (matching agent's input schema) or null`;
}

export async function findBestMatch(
  request: MatchingRequest,
  config: Partial<OpenAIConfig> = {},
  llmClient: LLMClient = openaiClient
): Promise<MatchingResult> {
  const prompt = generateMatchingPrompt(request);

  try {
    const response = await llmClient.chat<MatchResponse>(
      [
        {
          role: "system",
          content:
            "You are an expert AI agent matcher. Your task is to analyze job requirements and agent capabilities to find the best matches and generate valid input payloads.",
        },
        { role: "user", content: prompt },
      ],
      config,
      { type: "json_object" }
    );

    if (!response.structured) {
      throw new Error("Failed to get structured response from LLM");
    }

    const { agentId, confidence, reasoning, requestPayload } =
      response.structured;

    return {
      agentId,
      confidence,
      reasoning,
      requestPayload: requestPayload ?? null,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    // If this is a retry and it failed again, return unassigned result
    if (config.isRetry) {
      return {
        agentId: "",
        confidence: 0,
        reasoning: `Failed to find matching agent: ${errorMessage}`,
        requestPayload: null,
      };
    }

    // First attempt failed, try again with different settings
    console.warn("First matching attempt failed, retrying:", errorMessage);
    return findBestMatch(
      request,
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

export async function findTopMatches(
  request: MatchingRequest,
  limit: number = 3,
  config: Partial<OpenAIConfig> = {},
  llmClient: LLMClient = openaiClient
): Promise<MatchingResult[]> {
  const prompt =
    generateMatchingPrompt(request) +
    `\nPlease return an array of ${limit} matches in the same format.`;

  try {
    const response = await llmClient.chat<MatchResponse[]>(
      [
        {
          role: "system",
          content:
            "You are an expert AI agent matcher. Your task is to analyze job requirements and agent capabilities to find the best matches and generate valid input payloads.",
        },
        { role: "user", content: prompt },
      ],
      config,
      { type: "json_object" }
    );

    if (!response.structured) {
      throw new Error("Failed to get structured response from LLM");
    }

    return response.structured.slice(0, limit).map((result) => ({
      agentId: result.agentId,
      confidence: result.confidence,
      reasoning: result.reasoning,
      requestPayload: result.requestPayload ?? null,
    }));
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(
      `Failed to get or parse matching response for top matches: ${errorMessage}`
    );
  }
}
