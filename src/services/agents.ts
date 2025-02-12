import { Agent, AgentListItem } from "@/types/agent";
import { apiRequest } from "./api";

export const agentsApi = {
  list: () => apiRequest<AgentListItem[]>("/agents"),

  getById: (id: string) => apiRequest<Agent>(`/agents/${id}`),

  // Admin-only endpoints
  create: (data: Omit<Agent, "id" | "createdAt" | "updatedAt" | "_count">) =>
    apiRequest<Agent>("/admin/agents", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    id: string,
    data: Partial<Omit<Agent, "id" | "createdAt" | "updatedAt" | "_count">>
  ) =>
    apiRequest<Agent>("/admin/agents", {
      method: "PUT",
      body: JSON.stringify({ ...data, id }),
    }),

  delete: (id: string) =>
    apiRequest<void>(`/admin/agents/${id}`, {
      method: "DELETE",
    }),
};
