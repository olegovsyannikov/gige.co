import { JsonSchema } from "./common";

export type JobStatus =
  | "PENDING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED"
  | "REJECTED"
  | "RESUBMISSION_REQUIRED";

export interface Job {
  id: string;
  name: string;
  description: string;
  acceptanceCriteria: string;
  status: JobStatus;
  result: JsonSchema | null;
  createdByUserId: string;
  assignedAgentId: string | null;
  createdAt: string;
  updatedAt: string;
  agent?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
  _count?: {
    logs: number;
  };
}

export interface JobListItem {
  id: string;
  name: string;
  description: string;
  status: JobStatus;
  createdAt: string;
  agent?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    name: string | null;
  };
  _count: {
    logs: number;
  };
}

export interface JobLog {
  id: string;
  jobId: string;
  agentId: string | null;
  requestPayload: JsonSchema | null;
  responsePayload: JsonSchema | null;
  status: string;
  message: string | null;
  createdAt: string;
}
