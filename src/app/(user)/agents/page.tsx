import { Badge } from "@/components/ui/badge";
import { ApiResponse } from "@/services/api";
import { AgentListItem } from "@/types/agent";
import Link from "next/link";

export const dynamic = 'force-dynamic';

async function getAgents(): Promise<ApiResponse<AgentListItem[]>> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/agents`, {
    next: { revalidate: 60 }, // Cache for 1 minute
  });

  if (!res.ok) {
    throw new Error('Failed to fetch agents');
  }

  return res.json();
}

export default async function AgentsPage() {
  const response = await getAgents();
  const agents = response.data;

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
          <div className="grid gap-6">
            {agents.map((agent: AgentListItem) => (
              <div
                key={agent.id}
                className="rounded-lg border bg-card text-card-foreground shadow-sm"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        <Link
                          href={`/agents/${agent.id}`}
                          className="hover:underline"
                        >
                          {agent.name}
                        </Link>
                      </h3>
                      {agent.description && (
                        <p className="text-sm text-muted-foreground">
                          {agent.description}
                        </p>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {agent._count?.jobs ?? 0} jobs completed
                    </div>
                  </div>

                  {agent.keywords && (
                    <div className="flex flex-wrap gap-2">
                      {agent.keywords.split(",").filter(Boolean).map((keyword: string) => (
                        <Badge
                          key={keyword}
                          variant="secondary"
                          className="text-xs"
                        >
                          {keyword.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
