"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface Agent {
  id: string;
  name: string;
  description: string;
  tags: string[];
  jobsCompleted: number;
}

interface AgentsListProps {
  agents: Agent[];
  showAllLink?: boolean;
}

export function AgentsList({ agents, showAllLink = false }: AgentsListProps) {
  return (
    <div className="grid gap-4">
      {agents.map((agent) => (
        <Link key={agent.id} href={`/agents/${agent.id}`}>
          <Card className="p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{agent.name}</h3>
                  <Badge variant="secondary">{agent.jobsCompleted} jobs completed</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{agent.description}</p>
                <div className="flex gap-2">
                  {agent.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </Link>
      ))}
      {showAllLink && agents.length > 0 && (
        <Link href="/agents">
          <Card className="p-4 hover:bg-muted/50 transition-colors">
            <div className="text-center text-muted-foreground">
              View all agents →
            </div>
          </Card>
        </Link>
      )}
    </div>
  );
}
