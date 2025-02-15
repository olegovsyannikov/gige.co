import * as dotenv from "dotenv";
import { ethers } from "hardhat";
import type { Registry } from "../typechain-types";

dotenv.config();

async function main() {
  try {
    console.log("\n🚀 Starting Registry contract tests...\n");

    // Get the contract instance
    const registryAddress = process.env.REGISTRY_CONTRACT_ADDRESS;
    if (!registryAddress) {
      throw new Error("Registry contract address not found in .env");
    }
    console.log("📝 Registry contract address:", registryAddress);

    const Registry = await ethers.getContractFactory("Registry");
    const registry = Registry.attach(registryAddress) as Registry;

    // Get the signer
    const [signer] = await ethers.getSigners();
    console.log("🔑 Testing with account:", signer.address);

    const balance = await signer.provider.getBalance(signer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

    // Test 1: Register an agent
    console.log("📋 Test 1: Registering an agent...");
    const timestamp = Date.now();
    const agentId = ethers.id(`test-agent-${timestamp}`); // Creates a unique bytes32 hash
    const safeMockAddress = "0x" + "1".repeat(40); // Mock safe address
    console.log("Agent ID:", agentId);
    console.log("Safe Address:", safeMockAddress);

    const tx1 = await registry.registerAgent(agentId, safeMockAddress);
    console.log("Transaction sent:", tx1.hash);
    const receipt1 = await tx1.wait();
    if (!receipt1)
      throw new Error(
        "Failed to get transaction receipt for agent registration"
      );

    // Parse the logs to verify the event
    const agentRegisteredEvent = receipt1.logs[0]; // First log should be our event
    const eventInterface = new ethers.Interface([
      "event AgentRegistered(bytes32 indexed agentId, address indexed safe)",
    ]);

    try {
      const parsedLog = eventInterface.parseLog({
        topics: [...agentRegisteredEvent.topics],
        data: agentRegisteredEvent.data,
      });

      if (parsedLog) {
        console.log("\n✅ Event verified in logs:");
        console.log("- Event Name: AgentRegistered");
        console.log("- Agent ID:", parsedLog.args[0]);
        console.log("- Safe Address:", parsedLog.args[1]);
      }
    } catch (error) {
      console.log("❌ Failed to parse event log:", error);
    }

    console.log(
      "\n✅ Agent registered! Gas used:",
      receipt1.gasUsed.toString()
    );

    // Test 2: Assign a job
    console.log("\n📋 Test 2: Assigning a job...");
    const jobId = ethers.id(`test-job-${timestamp}`); // Use same timestamp for related tests
    console.log("Job ID:", jobId);
    console.log("Safe Address:", safeMockAddress);

    const tx2 = await registry.assignJob(jobId, safeMockAddress);
    console.log("Transaction sent:", tx2.hash);
    const receipt2 = await tx2.wait();
    if (!receipt2)
      throw new Error("Failed to get transaction receipt for job assignment");

    // Parse the logs to verify the event
    const jobAssignedEvent = receipt2.logs[0];
    const jobEventInterface = new ethers.Interface([
      "event JobAssigned(bytes32 indexed jobId, address indexed safe, uint256 timestamp)",
    ]);

    try {
      const parsedLog = jobEventInterface.parseLog({
        topics: [...jobAssignedEvent.topics],
        data: jobAssignedEvent.data,
      });

      if (parsedLog) {
        console.log("\n✅ Event verified in logs:");
        console.log("- Event Name: JobAssigned");
        console.log("- Job ID:", parsedLog.args[0]);
        console.log("- Safe Address:", parsedLog.args[1]);
        console.log(
          "- Timestamp:",
          new Date(Number(parsedLog.args[2]) * 1000).toISOString()
        );
      }
    } catch (error) {
      console.log("❌ Failed to parse event log:", error);
    }

    console.log("\n✅ Job assigned! Gas used:", receipt2.gasUsed.toString());

    // Test 3: Log a job status
    console.log("\nTest 3: Logging job status...");
    const tx3 = await registry.logJob(jobId, safeMockAddress, "COMPLETED");
    const receipt3 = await tx3.wait();
    if (!receipt3)
      throw new Error("Failed to get transaction receipt for job status log");
    console.log("Job status logged! Transaction hash:", receipt3.hash);

    console.log("\nAll tests completed successfully!");
  } catch (error) {
    console.error("Error running tests:", error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
