import type {
  PredictedSafeProps,
  SafeAccountConfig,
} from "@safe-global/protocol-kit";
import Safe from "@safe-global/protocol-kit";
import { ethers } from "ethers";
import { getProvider, getSigner, REGISTRY_ABI, SAFE_CONFIG } from "./config";

export class SafeService {
  private provider: ethers.providers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private protocolKit: Safe | null = null;
  private registryContract: ethers.Contract;

  constructor() {
    this.provider = getProvider();
    this.signer = getSigner();
    this.registryContract = new ethers.Contract(
      SAFE_CONFIG.registryAddress,
      REGISTRY_ABI,
      this.signer
    );
  }

  /**
   * Deploy a new Safe wallet for an agent
   */
  async deployAgentSafe(agentId: string): Promise<{
    safeAddress: string;
    txHash: string;
  }> {
    try {
      // Configure Safe Account
      const safeAccountConfig: SafeAccountConfig = {
        owners: [await this.signer.getAddress()],
        threshold: 1,
      };

      // Initialize Protocol Kit
      const predictedSafe: PredictedSafeProps = {
        safeAccountConfig,
        safeDeploymentConfig: {
          saltNonce: Math.trunc(Math.random() * 10 ** 10).toString(),
        },
      };

      this.protocolKit = await Safe.init({
        provider: SAFE_CONFIG.rpcUrl,
        predictedSafe,
      });

      if (!this.protocolKit) {
        throw new Error("Failed to initialize Safe Protocol Kit");
      }

      // Get predicted address
      const safeAddress = await this.protocolKit.getAddress();

      // Create deployment transaction
      const deploymentTransaction =
        await this.protocolKit.createSafeDeploymentTransaction();

      // Execute deployment transaction
      const tx = await this.signer.sendTransaction({
        to: deploymentTransaction.to,
        data: deploymentTransaction.data,
        value: ethers.BigNumber.from(deploymentTransaction.value),
      });

      // Wait for transaction receipt
      const receipt = await tx.wait();

      // Register agent in registry contract
      const registryTx = await this.registryContract.registerAgent(
        ethers.utils.formatBytes32String(agentId),
        safeAddress
      );
      await registryTx.wait();

      return {
        safeAddress,
        txHash: receipt.transactionHash,
      };
    } catch (error) {
      console.error("Error deploying Safe:", error);
      throw error;
    }
  }

  /**
   * Record a job assignment on-chain
   */
  async recordJobAssignment(
    jobId: string,
    agentSafeAddress: string
  ): Promise<string> {
    const tx = await this.registryContract.assignJob(
      ethers.utils.formatBytes32String(jobId),
      agentSafeAddress
    );
    const receipt = await tx.wait();
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
    const tx = await this.registryContract.logJob(
      ethers.utils.formatBytes32String(jobId),
      agentSafeAddress,
      status
    );
    const receipt = await tx.wait();
    return receipt.transactionHash;
  }
}

// Export singleton instance
export const safeService = new SafeService();
