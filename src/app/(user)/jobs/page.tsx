"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useJobs } from "@/hooks/jobs";
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

function JobCard({ job }: { job: JobListItem }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              <Link href={`/jobs/${job.id}`} className="hover:underline">
                {job.name}
              </Link>
            </CardTitle>
            <CardDescription>
              Created {new Date(job.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <JobStatusBadge status={job.status} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{job.description}</p>
        {job.agent && (
          <div className="text-sm text-muted-foreground">
            Assigned to:{" "}
            <Link href={`/agents/${job.agent.id}`} className="hover:underline">
              {job.agent.name}
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function JobCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
          <Skeleton className="h-5 w-[100px]" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-4" />
        <Skeleton className="h-4 w-[150px]" />
      </CardContent>
    </Card>
  );
}

export default function JobsPage() {
  const { data: response, isLoading, error } = useJobs();

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-600">Error loading jobs: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">My Jobs</h1>
            <p className="text-muted-foreground">
              View and manage your AI job requests
            </p>
          </div>
          <Link href="/jobs/new">
            <Button>Create New Job</Button>
          </Link>
        </div>

        <div className="grid gap-6">
          {isLoading ? (
            <>
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
            </>
          ) : (
            response?.data.map((job) => <JobCard key={job.id} job={job} />)
          )}
        </div>
      </div>
    </div>
  );
}
