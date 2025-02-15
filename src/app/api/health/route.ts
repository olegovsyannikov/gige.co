import { SAFE_CONFIG } from "@/lib/safe/config";
import { safeService } from "@/lib/safe/service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const provider = safeService.getProvider();

    // Check network connection
    const chainId = await provider.getChainId();

    // Get latest block
    const blockNumber = await provider.getBlockNumber();

    // Get gas price
    const feeData = await provider.estimateFeesPerGas();

    // Get signer
    const signer = safeService.getSigner();

    return NextResponse.json({
      status: "healthy",
      network: {
        chainId,
        configuredChainId: SAFE_CONFIG.network.chainId,
        isCorrectNetwork: chainId === SAFE_CONFIG.network.chainId,
      },
      provider: {
        rpcUrl: SAFE_CONFIG.rpcUrl.replace(/\/.*@/, "/***@"), // Hide API key if present
        blockNumber,
        gasPrice: feeData?.maxFeePerGas?.toString() ?? "unknown",
      },
      signer: signer.account
        ? {
            address: signer.account.address,
          }
        : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
