"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    useForceCompleteJob,
    useForceResubmitJob,
    useJob,
    useJobLogs,
    useReassignJob,
} from "@/hooks/jobs";
import { apiRequest } from "@/services/api";
import { AgentListItem } from "@/types/agent";
import { ApiResponse } from "@/types/common";
import { JobLog } from "@/types/job";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";

function JobLogItem({ log }: { log: JobLog }) {
  return (
    <div className="border-b py-4 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{log.status}</span>
        <span className="text-sm text-muted-foreground">
          {new Date(log.createdAt).toLocaleString()}
        </span>
      </div>
      {log.message && (
        <p className="text-sm text-muted-foreground">{log.message}</p>
      )}
      {log.requestPayload && (
        <div className="mt-2">
          <p className="text-sm font-medium mb-1">Request:</p>
          <pre className="text-sm bg-muted p-2 rounded-md overflow-auto">
            {JSON.stringify(log.requestPayload, null, 2)}
          </pre>
        </div>
      )}
      {log.responsePayload && (
        <div className="mt-2">
          <p className="text-sm font-medium mb-1">Response:</p>
          <pre className="text-sm bg-muted p-2 rounded-md overflow-auto">
            {JSON.stringify(log.responsePayload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function JobDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <Skeleton className="h-6 w-[300px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[200px]" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-[100px]" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminJobDetailPage() {
  const { id } = useParams() as { id: string };
  const { data: jobResponse, isLoading: isJobLoading } = useJob(id);
  const { data: logsResponse, isLoading: isLogsLoading } = useJobLogs(id);
  const { mutate: forceResubmit } = useForceResubmitJob();
  const { mutate: forceComplete } = useForceCompleteJob();
  const { mutate: reassign } = useReassignJob();

  // Fetch available agents
  const { data: agentsResponse, isLoading: isAgentsLoading } = useQuery<
    ApiResponse<AgentListItem[]>
  >({
    queryKey: ["agents"],
    queryFn: () => apiRequest("/api/agents"),
  });

  if (isJobLoading || isLogsLoading) {
    return (
      <div className="container mx-auto p-6">
        <JobDetailSkeleton />
      </div>
    );
  }

  const job = jobResponse?.data;
  const logs = logsResponse?.data;
  const agents = agentsResponse?.data || [];

  if (!job) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-600">Job not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{job.name}</h1>
            <p className="text-muted-foreground">
              Created {new Date(job.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex space-x-2">
            <Link href="/admin/jobs">
              <Button variant="outline">Back to Jobs</Button>
            </Link>
            {job.status === "FAILED" ||
            job.status === "REJECTED" ||
            job.status === "RESUBMISSION_REQUIRED" ? (
              <Button onClick={() => forceResubmit(job.id)}>
                Force Resubmit
              </Button>
            ) : job.status === "IN_PROGRESS" ? (
              <Button
                onClick={() =>
                  forceComplete({
                    id: job.id,
                    result: { message: "Completed by admin" },
                  })
                }
              >
                Force Complete
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Description</h3>
                <p className="text-muted-foreground">{job.description}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Acceptance Criteria</h3>
                <p className="text-muted-foreground">{job.acceptanceCriteria}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Status</h3>
                <p className="text-muted-foreground">{job.status}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Created By</h3>
                <p className="text-muted-foreground">
                  {job.user?.name || job.user?.id || "Unknown"}
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Assigned Agent</h3>
                <div className="flex items-center space-x-2">
                  {job.agent ? (
                    <Link
                      href={`/admin/agents/${job.agent.id}`}
                      className="text-muted-foreground hover:underline"
                    >
                      {job.agent.name}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                  <Select
                    onValueChange={(agentId) => reassign({ id: job.id, agentId })}
                    disabled={isAgentsLoading}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Reassign agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {job.result && (
                <div>
                  <h3 className="font-medium mb-1">Result</h3>
                  <pre className="text-sm bg-muted p-2 rounded-md overflow-auto">
                    {JSON.stringify(job.result, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Execution Log</CardTitle>
              <CardDescription>
                History of job processing and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {logs?.map((log) => (
                  <JobLogItem key={log.id} log={log} />
                ))}
                {!logs?.length && (
                  <p className="text-muted-foreground py-4">No logs available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
