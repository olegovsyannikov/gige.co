import { AgentForm } from "@/components/forms/agent-form";
import { AgentSafeInfo } from "@/components/safe/agent-safe-info";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditAgentPage({ params }: Props) {
  // Await params before using them
  const { id } = await params;

  const agent = id === "new"
    ? null
    : await prisma.agent.findUnique({
        where: { id },
      });

  if (id !== "new" && !agent) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">
        {agent ? "Edit Agent" : "Add New Agent"}
      </h2>
      <div className="grid gap-6 md:grid-cols-2">
        <AgentForm agent={agent} />
        {agent && <AgentSafeInfo agent={agent} />}
      </div>
    </div>
  );
}
