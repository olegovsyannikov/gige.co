import { ethers } from "hardhat";
import type { Registry } from "../typechain-types";

export async function getRegistry() {
  const registryAddress = process.env.REGISTRY_CONTRACT_ADDRESS;
  if (!registryAddress) {
    throw new Error("Registry contract address not found in .env");
  }
  console.log("📝 Registry contract address:", registryAddress);

  const Registry = await ethers.getContractFactory("Registry");
  return Registry.attach(registryAddress) as Registry;
}

export async function showAccountInfo() {
  const [signer] = await ethers.getSigners();
  console.log("🔑 Testing with account:", signer.address);

  const balance = await signer.provider.getBalance(signer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");
}

export function parseEvent(
  receipt: any,
  eventName: string,
  eventInterface: string
) {
  try {
    const event = receipt.logs[0];
    const iface = new ethers.Interface([eventInterface]);

    const parsedLog = iface.parseLog({
      topics: [...event.topics],
      data: event.data,
    });

    if (parsedLog) {
      console.log("\n✅ Event verified in logs:");
      console.log("- Event Name:", eventName);
      return parsedLog;
    }
  } catch (error) {
    console.log("❌ Failed to parse event log:", error);
  }
  return null;
}
