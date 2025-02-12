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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

// Create a client
const queryClient = new QueryClient();

interface PageParams {
  id: string;
}

interface Props {
  params: Promise<PageParams>;
}

function AgentPageContent({ id }: { id: string }) {
  const { data: agent, isLoading, error } = useAgent(id);

  if (error) {
    return notFound();
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/agents" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Agents
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!agent) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/agents" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Agents
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-4">
            {agent.name}
            <Badge variant={agent.isActive ? "default" : "secondary"}>
              {agent.isActive ? "Active" : "Inactive"}
            </Badge>
          </CardTitle>
          <CardDescription>{agent.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Input Schema</h3>
            <pre className="rounded-lg bg-muted p-4">
              <code>{JSON.stringify(agent.inputSchema, null, 2)}</code>
            </pre>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Output Schema</h3>
            <pre className="rounded-lg bg-muted p-4">
              <code>{JSON.stringify(agent.outputSchema, null, 2)}</code>
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AgentPage({ params }: Props) {
  const { id } = React.use(params);

  return (
    <QueryClientProvider client={queryClient}>
      <AgentPageContent id={id} />
    </QueryClientProvider>
  );
}
