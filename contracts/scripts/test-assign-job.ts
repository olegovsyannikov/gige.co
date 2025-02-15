import * as dotenv from "dotenv";
import { ethers } from "hardhat";
import { getRegistry, parseEvent, showAccountInfo } from "./utils";

dotenv.config();

async function main() {
  try {
    console.log("\n🚀 Starting Job Assignment Test...\n");

    const registry = await getRegistry();
    await showAccountInfo();

    // Use the safe address from our registered agent
    const safeMockAddress = "0x1111111111111111111111111111111111111111"; // This is the address we used in test 1

    // Generate unique job ID
    const timestamp = Date.now();
    const jobId = ethers.id(`test-job-${timestamp}`);

    console.log("📋 Test Parameters:");
    console.log("- Job ID:", jobId);
    console.log("- Safe Address:", safeMockAddress);

    // Assign job
    console.log("\n📝 Assigning job to registered agent's safe...");
    const tx = await registry.assignJob(jobId, safeMockAddress);
    console.log("Transaction sent:", tx.hash);

    const receipt = await tx.wait();
    if (!receipt) throw new Error("Failed to get transaction receipt");

    // Verify event
    const parsedLog = parseEvent(
      receipt,
      "JobAssigned",
      "event JobAssigned(bytes32 indexed jobId, address indexed safe, uint256 timestamp)"
    );

    if (parsedLog) {
      console.log("- Job ID:", parsedLog.args[0]);
      console.log("- Safe Address:", parsedLog.args[1]);
      console.log(
        "- Timestamp:",
        new Date(Number(parsedLog.args[2]) * 1000).toISOString()
      );
    }

    console.log("\n✅ Job assigned successfully!");
    console.log("Gas used:", receipt.gasUsed.toString());

    // Save job ID for the next test
    console.log("\n📌 Save these values for the job status test:");
    console.log("TEST_JOB_ID=", jobId);
    console.log("TEST_SAFE_ADDRESS=", safeMockAddress);
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
