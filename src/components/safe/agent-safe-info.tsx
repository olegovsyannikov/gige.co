"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { SAFE_CONFIG } from "@/lib/safe/config";
import type { Agent } from "@prisma/client";
import { ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";

interface Props {
  agent: Agent;
}

export function AgentSafeInfo({ agent }: Props) {
  const [isDeploying, setIsDeploying] = useState(false);
  const { toast } = useToast();

  const handleDeploySafe = async () => {
    try {
      setIsDeploying(true);
      const response = await fetch(`/api/admin/agents/${agent.id}/deploy-safe`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to deploy Safe wallet");
      }

      toast({
        title: "Success",
        description: "Safe wallet deployed successfully",
      });

      // Refresh the page to show updated Safe info
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  };

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

  const etherscanBaseUrl = getEtherscanBaseUrl();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Safe Wallet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {agent.safeAddress ? (
          <>
            <div className="space-y-2">
              <div className="text-sm font-medium">Safe Address</div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground break-all font-mono">
                  {agent.safeAddress}
                </div>
                <a
                  href={`${etherscanBaseUrl}/address/${agent.safeAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Deployment Transaction</div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground break-all font-mono">
                  {agent.safeTxHash}
                </div>
                <a
                  href={`${etherscanBaseUrl}/tx/${agent.safeTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This agent doesn&apos;t have a Safe wallet yet. Deploy one to enable
              blockchain operations.
            </p>
            <Button
              onClick={handleDeploySafe}
              disabled={isDeploying}
              className="w-full"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deploying Safe...
                </>
              ) : (
                "Deploy Safe Wallet"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
