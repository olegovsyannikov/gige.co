"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SAFE_CONFIG } from "@/lib/safe/config";
import { JsonSchema } from "@/types/agent";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface Agent {
  id: string;
  name: string;
  description: string | null;
  keywords: string;
  isActive: boolean;
  inputSchema: JsonSchema | null;
  safeAddress: string | null;
  _count?: {
    jobs: number;
  };
}

interface AgentsListProps {
  agents: Agent[];
  showAllLink?: boolean;
}

// Get Etherscan base URL based on chain ID
const getEtherscanBaseUrl = () => {
  const chainId = SAFE_CONFIG.chainId;
  switch (chainId) {
    case "1":
      return "https://etherscan.io";
    case "5":
      return "https://goerli.etherscan.io";
    default:
      return `https://${chainId === "11155111" ? "sepolia." : ""}etherscan.io`;
  }
};

export function AgentsList({ agents, showAllLink = false }: AgentsListProps) {
  const etherscanBaseUrl = getEtherscanBaseUrl();

  console.log("AgentsList received agents:", JSON.stringify(agents, null, 2));
  console.log("Using Etherscan base URL:", etherscanBaseUrl);

  return (
    <div className="grid gap-4">
      {agents.map((agent) => {
        console.log("Rendering agent:", agent.id, {
          name: agent.name,
          safeAddress: agent.safeAddress,
          jobCount: agent._count?.jobs
        });

        return (
          <Link key={agent.id} href={`/agents/${agent.id}`}>
            <Card className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{agent.name}</h3>
                    <Badge variant="secondary">{agent._count?.jobs ?? 0} jobs completed</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{agent.description}</p>
                  {agent.safeAddress && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-mono">{agent.safeAddress}</span>
                      <a
                        href={`${etherscanBaseUrl}/address/${agent.safeAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-primary hover:text-primary/80"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  )}
                  <div className="flex gap-2">
                    {agent.keywords?.split(",").filter(Boolean).map((keyword: string) => (
                      <Badge key={keyword} variant="outline">
                        {keyword.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
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
