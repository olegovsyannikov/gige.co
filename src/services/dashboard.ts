import { apiRequest } from "./api";

export interface DashboardData {
  userStats: {
    total: number;
    completed: number;
    pending: number;
  };
  globalStats: {
    total: number;
    completed: number;
    pending: number;
  };
  agentStats: {
    total: number;
    active: number;
  };
  agents: Array<{
    id: string;
    name: string;
    description: string;
    tags: string[];
    jobsCompleted: number;
  }>;
}

export async function getDashboardData(): Promise<DashboardData> {
  return apiRequest("/dashboard");
}
