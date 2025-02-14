import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

// Safe configuration
export const SAFE_CONFIG = {
  chainId: process.env.NEXT_PUBLIC_CHAIN_ID || "11155111", // Sepolia testnet
  rpcUrl: process.env.GOERLI_RPC_URL || "",
  registryAddress: process.env.REGISTRY_CONTRACT_ADDRESS || "",
  network: {
    name: "sepolia",
    chainId: 11155111,
  },
};

// Initialize viem clients
export const getProvider = () => {
  const rpcUrl = SAFE_CONFIG.rpcUrl;
  console.log(
    "Initializing provider with RPC URL:",
    rpcUrl.replace(/\/.*@/, "/***@")
  );

  if (!rpcUrl) {
    throw new Error("RPC URL not configured");
  }

  const transport = http(rpcUrl);

  return createPublicClient({
    chain: sepolia,
    transport,
  });
};

export const getSigner = () => {
  const privateKey = process.env.ADMIN_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("Admin private key not configured");
  }

  // Ensure private key has 0x prefix
  const formattedKey = privateKey.startsWith("0x")
    ? privateKey
    : `0x${privateKey}`;

  try {
    const account = privateKeyToAccount(formattedKey as `0x${string}`);
    const transport = http(SAFE_CONFIG.rpcUrl);

    return createWalletClient({
      account,
      chain: sepolia,
      transport,
    });
  } catch (error) {
    throw new Error(
      `Failed to create wallet client: ${
        error instanceof Error ? error.message : "Invalid private key format"
      }`
    );
  }
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
