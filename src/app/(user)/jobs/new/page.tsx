"use client";

import { JobForm } from "@/components/forms/job-form";
import { useCreateJob } from "@/hooks/jobs";

export default function NewJobPage() {
  const { mutateAsync: createJobMutation } = useCreateJob();

  const handleSubmit = async (data: {
    name: string;
    description: string;
    acceptanceCriteria: string;
  }) => {
    await createJobMutation(data);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Create New Job</h1>
          <p className="text-muted-foreground">
            Submit a new job request for AI processing
          </p>
        </div>

        <div className="max-w-2xl">
          <JobForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
