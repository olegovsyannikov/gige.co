import {
  createJob,
  forceCompleteJob,
  forceResubmitJob,
  getAllJobs,
  getJob,
  getJobLogs,
  getJobs,
  reassignJob,
  updateJob,
} from "@/services/jobs";
import { JsonSchema } from "@/types/common";
import { Job, JobListItem, JobLog } from "@/types/job";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query keys
const jobKeys = {
  all: ["jobs"] as const,
  lists: () => [...jobKeys.all, "list"] as const,
  list: (filters: string) => [...jobKeys.lists(), { filters }] as const,
  details: () => [...jobKeys.all, "detail"] as const,
  detail: (id: string) => [...jobKeys.details(), id] as const,
  logs: (jobId: string) => [...jobKeys.detail(jobId), "logs"] as const,
};

// Queries
export function useJobs() {
  return useQuery({
    queryKey: jobKeys.lists(),
    queryFn: getJobs,
  }) as {
    data: JobListItem[] | undefined;
    isLoading: boolean;
    error: Error | null;
  };
}

export function useJob(id: string) {
  return useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: () => getJob(id),
  }) as {
    data: Job | undefined;
    isLoading: boolean;
    error: Error | null;
  };
}

export function useJobLogs(jobId: string) {
  return useQuery({
    queryKey: jobKeys.logs(jobId),
    queryFn: () => getJobLogs(jobId),
  }) as {
    data: JobLog[] | undefined;
    isLoading: boolean;
    error: Error | null;
  };
}

export function useAllJobs() {
  return useQuery({
    queryKey: ["admin", "jobs"],
    queryFn: getAllJobs,
  }) as {
    data: JobListItem[] | undefined;
    isLoading: boolean;
    error: Error | null;
  };
}

// Mutations
export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      description: string;
      acceptanceCriteria: string;
    }) => createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Job> }) =>
      updateJob(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
  });
}

export function useForceResubmitJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => forceResubmitJob(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
  });
}

export function useForceCompleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, result }: { id: string; result: JsonSchema }) =>
      forceCompleteJob(id, result),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
  });
}

export function useReassignJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, agentId }: { id: string; agentId: string }) =>
      reassignJob(id, agentId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
  });
}
