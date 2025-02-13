"use client";

import { JobForm } from "@/components/forms/job-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useJob } from "@/hooks/jobs";
import { useParams } from "next/navigation";

function EditJobSkeleton() {
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
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function EditJobPage() {
  const { id } = useParams() as { id: string };
  const { data: job, isLoading, error } = useJob(id);

  async function handleSubmit(data: {
    name: string;
    description: string;
    acceptanceCriteria: string;
  }) {
    const response = await fetch(`/api/jobs/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update job");
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <EditJobSkeleton />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            {error?.message || "Failed to load job"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Convert job to the correct type
  const jobWithDates = {
    ...job,
    createdAt: new Date(job.createdAt),
    updatedAt: new Date(job.updatedAt),
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Job</CardTitle>
        </CardHeader>
        <CardContent>
          <JobForm job={jobWithDates} onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
