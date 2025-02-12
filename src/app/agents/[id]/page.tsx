'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAgent } from "@/hooks/agents";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: {
    id: string;
  };
}

export default function AgentPage({ params }: Props) {
  const { data: agent, isLoading, error } = useAgent(params.id);

  if (error) {
    return notFound();
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div>
            <Link href="/agents">
              <Button variant="ghost" className="pl-0">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Agents
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Skeleton className="h-4 w-32 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>

              <div>
                <Skeleton className="h-4 w-32 mb-4" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>

              <div>
                <Skeleton className="h-4 w-32 mb-4" />
                <div className="grid gap-4">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-48 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!agent) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <Link href="/agents">
            <Button variant="ghost" className="pl-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Agents
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{agent.name}</CardTitle>
            <CardDescription>{agent.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Capabilities</h3>
              <div className="flex flex-wrap gap-2">
                {agent.keywords.split(",").map((keyword: string) => (
                  <Badge
                    key={keyword}
                    variant="secondary"
                  >
                    {keyword.trim()}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3">
                  <div className="text-2xl font-bold">{agent._count.jobs}</div>
                  <div className="text-sm text-muted-foreground">Total Jobs</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-2xl font-bold">{agent._count.jobLogs}</div>
                  <div className="text-sm text-muted-foreground">Job Logs</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Input/Output Schema</h3>
              <div className="grid gap-4">
                <div className="rounded-lg bg-muted p-4">
                  <div className="text-sm font-medium mb-2">Input Schema</div>
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(agent.inputSchema, null, 2)}
                  </pre>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <div className="text-sm font-medium mb-2">Output Schema</div>
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(agent.outputSchema, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
