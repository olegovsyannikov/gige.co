import { Agent } from "./agent";
import { JsonSchema } from "./common";
import { Job } from "./job";

export interface MatchingResult {
  agentId: string;
  confidence: number;
  reasoning: string;
  requestPayload: JsonSchema | null;
}

export interface MatchingRequest {
  job: Job;
  availableAgents: Agent[];
}

export interface MatchingService {
  findBestMatch(request: MatchingRequest): Promise<MatchingResult>;
  findTopMatches(
    request: MatchingRequest,
    limit?: number
  ): Promise<MatchingResult[]>;
}

export interface OpenAIConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  isRetry?: boolean;
}
