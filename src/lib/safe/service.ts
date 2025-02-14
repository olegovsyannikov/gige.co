import type {
  PredictedSafeProps,
  SafeAccountConfig,
} from "@safe-global/protocol-kit";
import Safe from "@safe-global/protocol-kit";
import {
  type PublicClient,
  type WalletClient,
  parseAbi,
  stringToHex,
} from "viem";
import { sepolia } from "viem/chains";
import { getProvider, getSigner, REGISTRY_ABI, SAFE_CONFIG } from "./config";

export class SafeService {
  private provider: PublicClient;
  private signer: WalletClient;
  private protocolKit: Safe | null = null;

  constructor() {
    this.provider = getProvider();
    this.signer = getSigner();
  }

  // Add getter for provider
  getProvider(): PublicClient {
    return this.provider;
  }

  /**
   * Validate network connection and configuration
   */
  private async validateNetwork(): Promise<void> {
    try {
      const chainId = await this.provider.getChainId();
      console.log(`Connected to network: Chain ID ${chainId}`);

      // Verify chain ID matches configuration
      if (chainId !== SAFE_CONFIG.network.chainId) {
        throw new Error(
          `Network mismatch: Connected to ${chainId}, but configured for ${SAFE_CONFIG.network.chainId}`
        );
      }

      // Verify provider is responding
      const blockNumber = await this.provider.getBlockNumber();
      console.log(`Current block number: ${blockNumber}`);

      // Verify signer connection
      if (!this.signer.account) {
        throw new Error("No signer account available");
      }
      const signerAddress = this.signer.account.address;
      const balance = await this.provider.getBalance({
        address: signerAddress,
      });
      console.log(`Signer address: ${signerAddress}, Balance: ${balance} ETH`);

      if (balance === BigInt(0)) {
        console.warn("Warning: Signer has zero balance");
      }
    } catch (error) {
      console.error("Network validation failed:", error);
      throw new Error(
        `Network validation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Deploy a new Safe wallet for an agent
   */
  async deployAgentSafe(agentId: string): Promise<{
    safeAddress: string;
    txHash: string;
  }> {
    try {
      // Validate network connection first
      await this.validateNetwork();

      if (!this.signer.account) {
        throw new Error("No signer account available");
      }

      // Configure Safe Account
      const safeAccountConfig: SafeAccountConfig = {
        owners: [this.signer.account.address],
        threshold: 1,
      };

      // Initialize Protocol Kit with deployment config
      const predictedSafe: PredictedSafeProps = {
        safeAccountConfig,
        safeDeploymentConfig: {
          saltNonce: Math.trunc(Math.random() * 10 ** 10).toString(),
        },
      };

      console.log("Initializing Safe Protocol Kit...");
      console.log("Safe initialization config:", {
        predictedSafe: {
          safeAccountConfig,
          safeDeploymentConfig: predictedSafe.safeDeploymentConfig,
        },
      });

      // Initialize Safe with provider and signer
      this.protocolKit = await Safe.init({
        provider: SAFE_CONFIG.rpcUrl,
        signer: this.signer.account.address,
        predictedSafe,
      });

      if (!this.protocolKit) {
        throw new Error("Failed to initialize Safe Protocol Kit");
      }

      // Verify we can connect to the Safe
      const safeAddress = await this.protocolKit.getAddress();
      console.log(
        `Safe initialization successful, predicted address: ${safeAddress}`
      );

      // Create deployment transaction
      console.log("Creating deployment transaction...");
      const deploymentTransaction =
        await this.protocolKit.createSafeDeploymentTransaction();

      // Execute deployment transaction
      console.log("Executing deployment transaction...");
      const hash = await this.signer.sendTransaction({
        account: this.signer.account,
        chain: sepolia,
        to: deploymentTransaction.to,
        data: deploymentTransaction.data as `0x${string}`,
        value: BigInt(deploymentTransaction.value),
      });

      // Wait for transaction receipt
      console.log(`Waiting for deployment transaction ${hash}...`);
      const receipt = await this.provider.waitForTransactionReceipt({
        hash,
        confirmations: 2,
      });

      // Verify the deployment
      console.log("Verifying deployment...");
      const code = await this.provider.getBytecode({ address: safeAddress });
      if (!code || code === "0x") {
        throw new Error("Safe deployment failed - no code at deployed address");
      }

      // Register agent in registry contract
      console.log("Registering agent in registry...");
      const registryAbi = parseAbi(REGISTRY_ABI);
      const registerHash = await this.signer.writeContract({
        account: this.signer.account,
        chain: sepolia,
        address: SAFE_CONFIG.registryAddress as `0x${string}`,
        abi: registryAbi,
        functionName: "registerAgent",
        args: [stringToHex(agentId, { size: 32 }), safeAddress],
      });

      await this.provider.waitForTransactionReceipt({
        hash: registerHash,
        confirmations: 1,
      });

      return {
        safeAddress,
        txHash: receipt.transactionHash,
      };
    } catch (error) {
      console.error("Error deploying Safe:", error);
      throw new Error(
        error instanceof Error
          ? `Safe deployment failed: ${error.message}`
          : "Safe deployment failed with unknown error"
      );
    }
  }

  /**
   * Record a job assignment on-chain
   */
  async recordJobAssignment(
    jobId: string,
    agentSafeAddress: string
  ): Promise<string> {
    if (!this.signer.account) {
      throw new Error("No signer account available");
    }

    const registryAbi = parseAbi(REGISTRY_ABI);
    const hash = await this.signer.writeContract({
      account: this.signer.account,
      chain: sepolia,
      address: SAFE_CONFIG.registryAddress as `0x${string}`,
      abi: registryAbi,
      functionName: "assignJob",
      args: [stringToHex(jobId, { size: 32 }), agentSafeAddress],
    });

    const receipt = await this.provider.waitForTransactionReceipt({
      hash,
      confirmations: 1,
    });
    return receipt.transactionHash;
  }

  /**
   * Record a job status update on-chain
   */
  async recordJobLog(
    jobId: string,
    agentSafeAddress: string,
    status: string
  ): Promise<string> {
    if (!this.signer.account) {
      throw new Error("No signer account available");
    }

    const registryAbi = parseAbi(REGISTRY_ABI);
    const hash = await this.signer.writeContract({
      account: this.signer.account,
      chain: sepolia,
      address: SAFE_CONFIG.registryAddress as `0x${string}`,
      abi: registryAbi,
      functionName: "logJob",
      args: [stringToHex(jobId, { size: 32 }), agentSafeAddress, status],
    });

    const receipt = await this.provider.waitForTransactionReceipt({
      hash,
      confirmations: 1,
    });
    return receipt.transactionHash;
  }
}

// Export singleton instance
export const safeService = new SafeService();
