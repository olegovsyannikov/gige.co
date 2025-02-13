import { Badge } from "@/components/ui/badge";
import { JobStatus } from "@prisma/client";

const statusConfig = {
  PENDING: { label: "Pending", variant: "secondary" },
  ASSIGNED: { label: "Assigned", variant: "outline" },
  IN_PROGRESS: { label: "In Progress", variant: "default" },
  COMPLETED: { label: "Completed", variant: "secondary" },
  FAILED: { label: "Failed", variant: "destructive" },
  REJECTED: { label: "Rejected", variant: "destructive" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  RESUBMISSION_REQUIRED: { label: "Needs Resubmission", variant: "outline" },
} as const;

interface JobStatusBadgeProps {
  status: JobStatus;
}

export function JobStatusBadge({ status }: JobStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}
