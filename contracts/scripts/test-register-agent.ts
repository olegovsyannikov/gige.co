import * as dotenv from "dotenv";
import { ethers } from "hardhat";
import { getRegistry, parseEvent, showAccountInfo } from "./utils";

dotenv.config();

async function main() {
  try {
    console.log("\n🚀 Starting Agent Registration Test...\n");

    const registry = await getRegistry();
    await showAccountInfo();

    // Generate unique agent ID
    const timestamp = Date.now();
    const agentId = ethers.id(`test-agent-${timestamp}`);
    const safeMockAddress = "0x" + "1".repeat(40);

    console.log("📋 Test Parameters:");
    console.log("- Agent ID:", agentId);
    console.log("- Safe Address:", safeMockAddress);

    // Register agent
    const tx = await registry.registerAgent(agentId, safeMockAddress);
    console.log("\nTransaction sent:", tx.hash);

    const receipt = await tx.wait();
    if (!receipt) throw new Error("Failed to get transaction receipt");

    // Verify event
    const parsedLog = parseEvent(
      receipt,
      "AgentRegistered",
      "event AgentRegistered(bytes32 indexed agentId, address indexed safe)"
    );

    if (parsedLog) {
      console.log("- Agent ID:", parsedLog.args[0]);
      console.log("- Safe Address:", parsedLog.args[1]);
    }

    console.log("\n✅ Agent registered successfully!");
    console.log("Gas used:", receipt.gasUsed.toString());
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
