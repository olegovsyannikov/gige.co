import { DeleteAgentButton } from "@/components/agents/delete-agent-button";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AgentsPage() {
  const agents = await prisma.agent.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          jobs: true,
          jobLogs: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">AI Agents</h2>
        <Link href="/admin/agents/new">
          <Button>Add New Agent</Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Keywords</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Jobs</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => (
            <TableRow key={agent.id}>
              <TableCell>{agent.name}</TableCell>
              <TableCell>{agent.description}</TableCell>
              <TableCell>{agent.keywords}</TableCell>
              <TableCell>
                {agent.isActive ? (
                  <span className="text-green-600">Active</span>
                ) : (
                  <span className="text-red-600">Inactive</span>
                )}
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {agent._count.jobs} jobs ({agent._count.jobLogs} logs)
                </div>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Link href={`/admin/agents/${agent.id}`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <DeleteAgentButton
                    agentId={agent.id}
                    agentName={agent.name}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
