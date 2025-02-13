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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAgents } from "@/hooks/agents";
import { useJob } from "@/hooks/jobs";
import { JsonSchema } from "@/types/common";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

function AssignFormSkeleton() {
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
        </CardContent>
      </Card>
    </div>
  );
}

interface FormValues {
  agentId: string;
  [key: string]: string | number | unknown;
}

interface ExtendedJsonSchema extends JsonSchema {
  format?: string;
}

function createDynamicSchema(inputSchema: JsonSchema | undefined) {
  const shape: Record<string, z.ZodType> = {
    agentId: z.string({
      required_error: "Please select an agent",
    }),
  };

  if (inputSchema?.type === "object" && inputSchema.properties) {
    Object.entries(inputSchema.properties).forEach(([key, prop]) => {
      if (prop.type === "string") {
        shape[key] = prop.required
          ? z.string({ required_error: prop.description || `${key} is required` })
          : z.string().optional();
      } else if (prop.type === "number") {
        shape[key] = prop.required
          ? z.number({ required_error: prop.description || `${key} is required` })
          : z.number().optional();
      }
      // Add more types as needed
    });
  }

  return z.object(shape);
}

export default function AssignJobPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { data: job, isLoading: isJobLoading } = useJob(id);
  const { data: agents = [], isLoading: isAgentsLoading } = useAgents();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<(typeof agents)[number] | null>(null);

  // Add logging for debugging
  useEffect(() => {
    console.log('Agents:', agents);
    console.log('Available agents:', agents.filter((agent) => agent.isActive));
  }, [agents]);

  const form = useForm<FormValues>({
    resolver: zodResolver(
      selectedAgent?.inputSchema
        ? createDynamicSchema(selectedAgent.inputSchema as JsonSchema)
        : z.object({ agentId: z.string() })
    ),
  });

  // Reset form when agent changes
  useEffect(() => {
    if (selectedAgent) {
      form.reset({ agentId: selectedAgent.id });
    }
  }, [selectedAgent, form]);

  async function handleSubmit(data: FormValues) {
    try {
      setIsSubmitting(true);
      setError(null);

      const { agentId, ...userInputs } = data;

      const response = await fetch(`/api/jobs/${id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          userInputs,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to assign job");
      }

      router.push(`/jobs/${id}`);
      router.refresh();
    } catch (error) {
      console.error("Error assigning job:", error);
      setError(error instanceof Error ? error.message : "Failed to assign job");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleAgentChange(agentId: string) {
    const agent = agents.find((a) => a.id === agentId);
    setSelectedAgent(agent || null);
    form.setValue("agentId", agentId);
  }

  function renderField(field: string, schema: ExtendedJsonSchema) {
    const type = schema.type;
    const description = schema.description;

    if (type === "string") {
      if (schema.format === "textarea") {
        return (
          <Textarea
            {...form.register(field)}
            placeholder={description}
            className="h-32"
          />
        );
      }
      return (
        <Input
          {...form.register(field)}
          type="text"
          placeholder={description}
        />
      );
    }

    if (type === "number") {
      return (
        <Input
          {...form.register(field, { valueAsNumber: true })}
          type="number"
          placeholder={description}
        />
      );
    }

    return null;
  }

  if (isJobLoading || isAgentsLoading) {
    return (
      <div className="container mx-auto p-6">
        <AssignFormSkeleton />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-600">Job not found</div>
      </div>
    );
  }

  const availableAgents = agents.filter((agent) => agent.isActive);

  return (
    <div className="container mx-auto  p-6">
      <Card>
        <CardHeader>
          <CardTitle>Assign Job</CardTitle>
          <CardDescription>
            Select an agent and provide any required inputs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="agentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        handleAgentChange(value);
                        field.onChange(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an agent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableAgents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose an agent to handle this job
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedAgent?.inputSchema && (
                <div className="space-y-4">
                  {Object.entries(selectedAgent.inputSchema.properties || {}).map(
                    ([key, prop]) => (
                      <FormField
                        key={key}
                        control={form.control}
                        name={key}
                        render={() => (
                          <FormItem>
                            <FormLabel>
                              {prop.title || key}
                              {prop.required && (
                                <span className="text-destructive"> *</span>
                              )}
                            </FormLabel>
                            <FormControl>
                              {renderField(key, prop as ExtendedJsonSchema)}
                            </FormControl>
                            {prop.description && (
                              <FormDescription>{prop.description}</FormDescription>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )
                  )}
                </div>
              )}

              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/jobs/${id}`)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Assigning..." : "Assign"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
