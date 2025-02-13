import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { JobStatusBadge } from "@/components/ui/job-status-badge";
import { JobLog, JobStatus } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";

interface JobLogItemProps {
  log: JobLog & {
    status: JobStatus;
  };
}

export function JobLogItem({ log }: JobLogItemProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-2">
        <JobStatusBadge status={log.status} />
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
        </span>
      </CardHeader>
      <CardContent className="py-2">
        {log.message && (
          <p className="text-sm text-muted-foreground">{log.message}</p>
        )}
        {log.requestPayload && (
          <details className="mt-2">
            <summary className="text-sm font-medium cursor-pointer">
              Request Payload
            </summary>
            <pre className="mt-2 p-2 bg-muted rounded-md text-xs overflow-auto">
              {JSON.stringify(log.requestPayload, null, 2)}
            </pre>
          </details>
        )}
        {log.responsePayload && (
          <details className="mt-2">
            <summary className="text-sm font-medium cursor-pointer">
              Response Payload
            </summary>
            <pre className="mt-2 p-2 bg-muted rounded-md text-xs overflow-auto">
              {JSON.stringify(log.responsePayload, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
