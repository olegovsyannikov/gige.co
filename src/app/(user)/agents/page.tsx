import { AgentsList } from "@/components/agents-list";
import { ApiResponse } from "@/services/api";
import { AgentListItem } from "@/types/agent";

export const dynamic = 'force-dynamic';

async function getAgents(): Promise<ApiResponse<AgentListItem[]>> {
  console.log("Fetching agents from:", `${process.env.NEXT_PUBLIC_APP_URL}/api/agents`);

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/agents`, {
    next: { revalidate: 60 }, // Cache for 1 minute
  });

  if (!res.ok) {
    console.error("Failed to fetch agents:", res.status, res.statusText);
    throw new Error('Failed to fetch agents');
  }

  const data = await res.json();
  console.log("Received agents data:", JSON.stringify(data, null, 2));
  return data;
}

export default async function AgentsPage() {
  console.log("Rendering AgentsPage");
  const response = await getAgents();
  const agents = response.data;
  console.log("Agents to display:", JSON.stringify(agents, null, 2));

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">AI Agents</h1>
          <p className="text-muted-foreground">
            Browse our available AI agents and their capabilities
          </p>
        </div>

        {agents.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No agents available at the moment.
          </div>
        ) : (
          <AgentsList agents={agents} />
        )}
      </div>
    </div>
  );
}
