import { ethers } from "ethers";

// Safe configuration
export const SAFE_CONFIG = {
  chainId: process.env.NEXT_PUBLIC_CHAIN_ID || "11155111", // Sepolia testnet
  rpcUrl: process.env.GOERLI_RPC_URL || "",
  registryAddress: process.env.REGISTRY_CONTRACT_ADDRESS || "",
};

// Initialize ethers provider and signer
export const getProvider = () => {
  return new ethers.providers.JsonRpcProvider(SAFE_CONFIG.rpcUrl);
};

export const getSigner = () => {
  const provider = getProvider();
  if (!process.env.ADMIN_PRIVATE_KEY) {
    throw new Error("Admin private key not configured");
  }
  return new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
};

// Registry contract ABI
export const REGISTRY_ABI = [
  "function registerAgent(bytes32 agentId, address safe) external",
  "function assignJob(bytes32 jobId, address safe) external",
  "function logJob(bytes32 jobId, address safe, string status) external",
  "event AgentRegistered(bytes32 indexed agentId, address indexed safe)",
  "event JobAssigned(bytes32 indexed jobId, address indexed safe, uint256 timestamp)",
  "event JobLogCreated(bytes32 indexed jobId, address indexed safe, string status, uint256 timestamp)",
];
