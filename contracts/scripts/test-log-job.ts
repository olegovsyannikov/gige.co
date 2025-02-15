import * as dotenv from "dotenv";
import { getRegistry, parseEvent, showAccountInfo } from "./utils";

dotenv.config();

async function main() {
  try {
    console.log("\n🚀 Starting Job Status Logging Test...\n");

    const registry = await getRegistry();
    await showAccountInfo();

    // Use existing job ID and safe address
    const jobId = process.env.TEST_JOB_ID;
    const safeMockAddress = process.env.TEST_SAFE_ADDRESS;

    if (!jobId || !safeMockAddress) {
      throw new Error("Please set TEST_JOB_ID and TEST_SAFE_ADDRESS in .env");
    }

    console.log("📋 Test Parameters:");
    console.log("- Job ID:", jobId);
    console.log("- Safe Address:", safeMockAddress);
    console.log("- Status: COMPLETED");

    // Log job status
    const tx = await registry.logJob(jobId, safeMockAddress, "COMPLETED");
    console.log("\nTransaction sent:", tx.hash);

    const receipt = await tx.wait();
    if (!receipt) throw new Error("Failed to get transaction receipt");

    // Verify event
    const parsedLog = parseEvent(
      receipt,
      "JobLogCreated",
      "event JobLogCreated(bytes32 indexed jobId, address indexed safe, string status, uint256 timestamp)"
    );

    if (parsedLog) {
      console.log("- Job ID:", parsedLog.args[0]);
      console.log("- Safe Address:", parsedLog.args[1]);
      console.log("- Status:", parsedLog.args[2]);
      console.log(
        "- Timestamp:",
        new Date(Number(parsedLog.args[3]) * 1000).toISOString()
      );
    }

    console.log("\n✅ Job status logged successfully!");
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
