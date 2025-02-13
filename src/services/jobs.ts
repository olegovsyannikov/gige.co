import { JsonValue } from "@/types/common";
import { Job, JobListItem, JobLog } from "@/types/job";
import { apiRequest } from "./api";

export async function getJobs(): Promise<JobListItem[]> {
  return apiRequest("/jobs");
}

export async function getAllJobs(): Promise<JobListItem[]> {
  return apiRequest("/admin/jobs");
}

export async function getJob(id: string): Promise<Job> {
  return apiRequest(`/jobs/${id}`);
}

export async function getJobLogs(id: string): Promise<JobLog[]> {
  return apiRequest(`/jobs/${id}/logs`);
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

export async function autoAssignJob(id: string): Promise<Job> {
  return apiRequest(`/jobs/${id}/auto-assign`, {
    method: "POST",
  });
}

export async function reassignJob(id: string, agentId: string): Promise<Job> {
  return apiRequest(`/jobs/${id}/assign`, {
    method: "POST",
    body: JSON.stringify({ agentId }),
  });
}

export async function forceResubmitJob(id: string): Promise<Job> {
  return apiRequest(`/admin/jobs/${id}/resubmit`, {
    method: "POST",
  });
}

export async function forceCompleteJob(
  id: string,
  result: JsonValue
): Promise<Job> {
  return apiRequest(`/admin/jobs/${id}/complete`, {
    method: "POST",
    body: JSON.stringify({ result }),
  });
}

export async function cancelJobAssignment(id: string): Promise<Job> {
  return apiRequest(`/jobs/${id}/cancel`, {
    method: "POST",
  });
}

export async function executeJob(id: string): Promise<Job> {
  return apiRequest(`/jobs/${id}/execute`, {
    method: "POST",
  });
}
