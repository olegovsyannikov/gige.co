import * as dotenv from "dotenv";
import { getRegistry, showAccountInfo } from "./utils";

dotenv.config();

async function main() {
  try {
    console.log("\n🚀 Starting Job Assignment Error Test...\n");

    const registry = await getRegistry();
    await showAccountInfo();

    // Use the existing job ID and safe address
    const jobId = process.env.TEST_JOB_ID;
    const safeMockAddress = process.env.TEST_SAFE_ADDRESS;

    if (!jobId || !safeMockAddress) {
      throw new Error("Please set TEST_JOB_ID and TEST_SAFE_ADDRESS in .env");
    }

    console.log("📋 Test Parameters:");
    console.log("- Job ID:", jobId);
    console.log("- Safe Address:", safeMockAddress);

    console.log("\n📝 Attempting to assign already assigned job...");
    console.log("Expected: This should fail with 'Job already assigned' error");

    try {
      const tx = await registry.assignJob(jobId, safeMockAddress);
      console.log("Transaction sent:", tx.hash);

      const receipt = await tx.wait();
      if (receipt) {
        console.log(
          "❌ Error: Transaction succeeded when it should have failed!"
        );
        process.exitCode = 1;
      }
    } catch (error: any) {
      if (error.message.includes("Job already assigned")) {
        console.log("\n✅ Test passed! Received expected error:");
        console.log(error.message);
      } else {
        console.log("\n❌ Test failed! Received unexpected error:");
        console.log(error.message);
        process.exitCode = 1;
      }
    }
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
