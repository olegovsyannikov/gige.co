"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAllJobs, useForceResubmitJob } from "@/hooks/jobs";
import { JobListItem } from "@/types/job";
import Link from "next/link";

function JobStatusBadge({ status }: { status: JobListItem["status"] }) {
  const getStatusColor = (status: JobListItem["status"]) => {
    switch (status) {
      case "COMPLETED":
        return "text-green-600";
      case "FAILED":
      case "REJECTED":
        return "text-red-600";
      case "IN_PROGRESS":
        return "text-blue-600";
      case "RESUBMISSION_REQUIRED":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <span className={`font-medium ${getStatusColor(status)}`}>{status}</span>
  );
}

function JobTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Agent</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="h-4 w-[200px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[150px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[150px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[100px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[100px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-8 w-[100px]" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function AdminJobsPage() {
  const { data: jobs, isLoading, error } = useAllJobs();
  const { mutate: forceResubmit } = useForceResubmitJob();

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-600">Error loading jobs: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Job Management</h1>
        <p className="text-muted-foreground">
          Manage and monitor all jobs in the system
        </p>
      </div>

      {isLoading ? (
        <JobTableSkeleton />
      ) : !jobs?.length ? (
        <div className="text-muted-foreground">No jobs found</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>
                  <Link
                    href={`/admin/jobs/${job.id}`}
                    className="hover:underline"
                  >
                    {job.name}
                  </Link>
                </TableCell>
                <TableCell>
                  {job.user?.name || job.user?.id || "Unknown"}
                </TableCell>
                <TableCell>
                  {job.agent ? (
                    <Link
                      href={`/admin/agents/${job.agent.id}`}
                      className="hover:underline"
                    >
                      {job.agent.name}
                    </Link>
                  ) : (
                    "Unassigned"
                  )}
                </TableCell>
                <TableCell>
                  <JobStatusBadge status={job.status} />
                </TableCell>
                <TableCell>
                  {new Date(job.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Link href={`/admin/jobs/${job.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    {job.status === "FAILED" ||
                    job.status === "REJECTED" ||
                    job.status === "RESUBMISSION_REQUIRED" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => forceResubmit(job.id)}
                      >
                        Resubmit
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
