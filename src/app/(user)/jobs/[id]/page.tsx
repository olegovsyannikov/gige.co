"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { JobActionButtons } from "@/components/ui/job-action-buttons";
import { JobLogItem } from "@/components/ui/job-log-item";
import { JobStatusBadge } from "@/components/ui/job-status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAutoAssignJob,
  useCancelJobAssignment,
  useExecuteJob,
  useJob,
  useJobLogs,
} from "@/hooks/jobs";
import { JobStatus } from "@prisma/client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

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

export default function JobDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { data: job, isLoading: isJobLoading, error: jobError } = useJob(id);
  const { data: logs, isLoading: isLogsLoading } = useJobLogs(id);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: autoAssign, isPending: isAssigning } = useAutoAssignJob();
  const { mutateAsync: cancelAssignment, isPending: isCancelling } = useCancelJobAssignment();
  const { mutateAsync: execute, isPending: isExecuting } = useExecuteJob();

  async function handleAutoAssign() {
    setError(null);
    try {
      await autoAssign(id);
    } catch (error) {
      console.error("Error auto-assigning job:", error);
      setError(error instanceof Error ? error.message : "Failed to auto-assign job");
    }
  }

  function handleManualAssign() {
    router.push(`/jobs/${id}/assign`);
  }

  async function handleCancelAssignment() {
    setError(null);
    try {
      await cancelAssignment(id);
    } catch (error) {
      console.error("Error cancelling assignment:", error);
      setError(error instanceof Error ? error.message : "Failed to cancel assignment");
    }
  }

  async function handleExecute() {
    setError(null);
    try {
      await execute(id);
    } catch (error) {
      console.error("Error executing job:", error);
      setError(error instanceof Error ? error.message : "Failed to execute job");
    }
  }

  if (isJobLoading || isLogsLoading) {
    return (
      <div className="container mx-auto p-6">
        <JobDetailSkeleton />
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-600">
          {jobError?.message || "Job not found"}
        </div>
      </div>
    );
  }

  // Convert job to the correct type
  const jobWithTypedStatus = {
    ...job,
    status: job.status as JobStatus,
    createdAt: new Date(job.createdAt),
    updatedAt: new Date(job.updatedAt),
  };

  // Convert logs to the correct type
  const typedLogs = logs?.map(log => ({
    ...log,
    status: log.status as JobStatus,
    createdAt: new Date(log.createdAt),
  }));

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{job.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <JobStatusBadge status={job.status as JobStatus} />
              <span className="text-sm text-muted-foreground">
                Created {new Date(job.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {(job.status === "PENDING" || job.status === "RESUBMISSION_REQUIRED") ? (
              <Link href={`/jobs/${job.id}/edit`}>
                <Button variant="outline">Edit Job</Button>
              </Link>
            ) : (
              <Button variant="outline" disabled>
                Edit disabled
              </Button>
            )}
            <Link href="/jobs">
              <Button variant="outline">Back to Jobs</Button>
            </Link>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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
            {job.agent && (
              <div>
                <h3 className="font-medium mb-1">Assigned Agent</h3>
                <Link
                  href={`/agents/${job.agent.id}`}
                  className="text-muted-foreground hover:underline"
                >
                  {job.agent.name}
                </Link>
              </div>
            )}
            {job.result && (
              <div>
                <h3 className="font-medium mb-1">Result</h3>
                <pre className="text-sm bg-muted p-2 rounded-md overflow-auto">
                  {JSON.stringify(job.result, null, 2)}
                </pre>
              </div>
            )}

            <div className="pt-4">
              <JobActionButtons
                job={jobWithTypedStatus}
                onAutoAssign={isAssigning ? undefined : handleAutoAssign}
                onManualAssign={isAssigning || isCancelling || isExecuting ? undefined : handleManualAssign}
                onCancelAssignment={isCancelling ? undefined : (job.status === "ASSIGNED" || job.status === "RESUBMISSION_REQUIRED" ? handleCancelAssignment : undefined)}
                onExecute={isExecuting ? undefined : ((job.status === "ASSIGNED" || job.status === "RESUBMISSION_REQUIRED") ? handleExecute : undefined)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Log</CardTitle>
            <CardDescription>
              History of job processing and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {typedLogs?.map((log) => (
                <JobLogItem key={log.id} log={log} />
              ))}
              {!logs?.length && (
                <p className="text-muted-foreground">No logs available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
