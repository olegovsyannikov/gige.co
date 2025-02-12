import { JsonSchema } from "@/types/common";
import { Job, JobListItem, JobLog } from "@/types/job";
import { apiRequest } from "./api";

export async function getJobs(): Promise<JobListItem[]> {
  return apiRequest("/jobs");
}

export async function getJob(id: string): Promise<Job> {
  return apiRequest(`/jobs/${id}`);
}

export async function createJob(data: {
  name: string;
  description: string;
  acceptanceCriteria: string;
}): Promise<Job> {
  return apiRequest("/jobs", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateJob(id: string, data: Partial<Job>): Promise<Job> {
  return apiRequest(`/jobs/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function getJobLogs(jobId: string): Promise<JobLog[]> {
  return apiRequest(`/jobs/${jobId}/logs`);
}

// Admin-only endpoints
export async function getAllJobs(): Promise<JobListItem[]> {
  return apiRequest("/admin/jobs");
}

export async function forceResubmitJob(id: string): Promise<Job> {
  return apiRequest(`/admin/jobs/${id}/resubmit`, {
    method: "POST",
  });
}

export async function forceCompleteJob(
  id: string,
  result: JsonSchema
): Promise<Job> {
  return apiRequest(`/admin/jobs/${id}/complete`, {
    method: "POST",
    body: JSON.stringify({ result }),
  });
}

export async function reassignJob(id: string, agentId: string): Promise<Job> {
  return apiRequest(`/admin/jobs/${id}/reassign`, {
    method: "POST",
    body: JSON.stringify({ agentId }),
  });
}
