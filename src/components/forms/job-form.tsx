"use client";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Job } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const jobFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  acceptanceCriteria: z.string().min(10, {
    message: "Acceptance criteria must be at least 10 characters.",
  }),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

interface JobFormProps {
  job?: Job;
  onSubmit: (data: JobFormValues) => Promise<void>;
}

export function JobForm({ job, onSubmit }: JobFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      name: job?.name || "",
      description: job?.description || "",
      acceptanceCriteria: job?.acceptanceCriteria || "",
    },
  });

  async function handleSubmit(data: JobFormValues) {
    try {
      setIsLoading(true);
      await onSubmit(data);
      router.push("/jobs");
    } catch (error) {
      console.error("Error submitting job:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter job name" {...field} />
              </FormControl>
              <FormDescription>
                A clear and concise name for your job.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter job description"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Detailed description of what needs to be done.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="acceptanceCriteria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Acceptance Criteria</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter acceptance criteria"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Specific criteria that must be met for the job to be considered complete.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : job ? "Update Job" : "Create Job"}
        </Button>
      </form>
    </Form>
  );
}
