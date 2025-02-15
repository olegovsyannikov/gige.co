import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { JobStatusBadge } from "@/components/ui/job-status-badge";
import { SAFE_CONFIG } from "@/lib/safe/config";
import { JobLog, JobStatus } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink } from "lucide-react";

interface JobLogItemProps {
  log: JobLog & {
    status: JobStatus;
  };
}

// Get Etherscan base URL based on chain ID
const getEtherscanBaseUrl = () => {
  const chainId = SAFE_CONFIG.chainId;
  switch (chainId) {
    case "1":
      return "https://etherscan.io";
    case "5":
      return "https://goerli.etherscan.io";
    default:
      return `https://${chainId === "11155111" ? "sepolia." : ""}etherscan.io`;
  }
};

export function JobLogItem({ log }: JobLogItemProps) {
  const etherscanBaseUrl = getEtherscanBaseUrl();
  const timeAgo = formatDistanceToNow(new Date(log.createdAt), {
    addSuffix: true,
  });

  return (
    <Card>
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <JobStatusBadge status={log.status} />
            <span className="text-sm text-muted-foreground">{timeAgo}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        {log.message && (
          <p className="text-sm text-muted-foreground">{log.message}</p>
        )}
        {log.onChainTxHash && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono text-xs">Tx: {log.onChainTxHash}</span>
            <a
              href={`${etherscanBaseUrl}/tx/${log.onChainTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}
        {log.requestPayload && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Request</h4>
            <pre className="text-xs bg-muted p-2 rounded-md overflow-auto">
              <code>{JSON.stringify(log.requestPayload, null, 2)}</code>
            </pre>
          </div>
        )}
        {log.responsePayload && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Response</h4>
            <pre className="text-xs bg-muted p-2 rounded-md overflow-auto">
              <code>{JSON.stringify(log.responsePayload, null, 2)}</code>
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
