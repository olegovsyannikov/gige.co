import { SAFE_CONFIG } from "@/lib/safe/config";
import { safeService } from "@/lib/safe/service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const provider = safeService.getProvider();

    // Check network connection
    const network = await provider.getNetwork();

    // Get latest block
    const blockNumber = await provider.getBlockNumber();

    // Get gas price
    const gasPrice = await provider.getGasPrice();

    // Check signer
    const signer = await provider
      .getSigner()
      .getAddress()
      .catch(() => null);

    return NextResponse.json({
      status: "healthy",
      network: {
        name: network.name,
        chainId: network.chainId,
        configuredChainId: SAFE_CONFIG.network.chainId,
        isCorrectNetwork: network.chainId === SAFE_CONFIG.network.chainId,
      },
      provider: {
        rpcUrl: SAFE_CONFIG.rpcUrl.replace(/\/.*@/, "/***@"), // Hide API key if present
        blockNumber,
        gasPrice: gasPrice.toString(),
      },
      signer: signer
        ? {
            address: signer,
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
