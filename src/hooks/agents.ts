import { agentsApi } from "@/services/agents";
import { Agent, AgentListItem } from "@/types/agent";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";

// Query keys
export const agentKeys = {
  all: ["agents"] as const,
  lists: () => [...agentKeys.all, "list"] as const,
  list: (filters: string) => [...agentKeys.lists(), { filters }] as const,
  details: () => [...agentKeys.all, "detail"] as const,
  detail: (id: string) => [...agentKeys.details(), id] as const,
};

// Queries
export const useAgents = (options?: UseQueryOptions<AgentListItem[]>) => {
  return useQuery({
    queryKey: agentKeys.lists(),
    queryFn: () => agentsApi.list(),
    ...options,
  });
};

export const useAgent = (id: string, options?: UseQueryOptions<Agent>) => {
  return useQuery({
    queryKey: agentKeys.detail(id),
    queryFn: () => agentsApi.getById(id),
    ...options,
  });
};

// Mutations
export const useCreateAgent = (
  options?: UseMutationOptions<
    Agent,
    Error,
    Omit<Agent, "id" | "createdAt" | "updatedAt" | "_count">
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: agentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
    },
    ...options,
  });
};

export const useUpdateAgent = (
  options?: UseMutationOptions<
    Agent,
    Error,
    {
      id: string;
      data: Partial<Omit<Agent, "id" | "createdAt" | "updatedAt" | "_count">>;
    }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => agentsApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(data.id) });
    },
    ...options,
  });
};

export const useDeleteAgent = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: agentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
    },
    ...options,
  });
};
