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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Agent } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const agentFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  endpointURL: z.string().url({
    message: "Please enter a valid URL.",
  }),
  inputSchema: z.string().min(2, {
    message: "Input schema is required.",
  }).refine((val) => {
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, {
    message: "Must be valid JSON",
  }),
  outputSchema: z.string().min(2, {
    message: "Output schema is required.",
  }).refine((val) => {
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, {
    message: "Must be valid JSON",
  }),
  keywords: z.string().min(2, {
    message: "At least one keyword is required.",
  }),
  isActive: z.boolean().default(true),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

interface AgentFormProps {
  agent: Agent | null;
}

export function AgentForm({ agent }: AgentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: agent
      ? {
          ...agent,
          inputSchema: JSON.stringify(agent.inputSchema, null, 2),
          outputSchema: JSON.stringify(agent.outputSchema, null, 2),
        }
      : {
          name: "",
          description: "",
          endpointURL: "",
          inputSchema: "",
          outputSchema: "",
          keywords: "",
          isActive: true,
        },
  });

  async function onSubmit(data: AgentFormValues) {
    setError(null);
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/admin/agents", {
        method: agent ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          id: agent?.id,
          inputSchema: JSON.parse(data.inputSchema),
          outputSchema: JSON.parse(data.outputSchema),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to save agent");
      }

      router.push("/admin/agents");
      router.refresh();
    } catch (error: unknown) {
      console.error("Error saving agent:", error);
      setError(error instanceof Error ? error.message : "Failed to save agent");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <div className="p-4 mb-4 text-sm text-red-800 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Agent name" {...field} />
              </FormControl>
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
                  placeholder="Describe what tasks this agent can handle"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endpointURL"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endpoint URL</FormLabel>
              <FormControl>
                <Input placeholder="https://api.example.com/agent" {...field} />
              </FormControl>
              <FormDescription>
                The HTTPS endpoint where the agent can be reached
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="inputSchema"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Input Schema</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="JSON schema for agent input"
                  className="font-mono"
                  rows={6}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                JSON schema defining the required input format
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="outputSchema"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Output Schema</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="JSON schema for agent output"
                  className="font-mono"
                  rows={6}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                JSON schema defining the expected output format
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keywords</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., copywriting, data-analysis"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Comma-separated keywords to help with agent matching
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <FormDescription>
                  Disable to temporarily remove this agent from the available pool
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : agent ? "Update Agent" : "Create Agent"}
        </Button>
      </form>
    </Form>
  );
}
