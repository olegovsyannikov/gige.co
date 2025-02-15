import { prisma } from "@/lib/prisma";
import { safeService } from "@/lib/safe/service";
import { type Job, type JobLog, type JobLogStatus } from "@prisma/client";

interface JobWithAgent extends Job {
  agent: {
    id: string;
    name: string;
    safeAddress: string | null;
  } | null;
  logs: JobLog[];
}

/**
 * Records a job assignment and its status on-chain
 */
export async function recordJobOnChain(
  job: JobWithAgent,
  status: JobLogStatus,
  logId: string
): Promise<{ assignmentTxHash?: string; logTxHash?: string }> {
  // Skip if agent doesn't have a Safe wallet
  if (!job.agent?.safeAddress) {
    console.log("Skipping on-chain recording: agent has no Safe wallet");
    return {};
  }

  try {
    let assignmentTxHash: string | undefined;

    // Only record assignment if not already recorded
    if (!job.onChainAssignmentTxHash) {
      try {
        assignmentTxHash = await safeService.recordJobAssignment(
          job.id,
          job.agent.safeAddress
        );
        console.log(`Job assignment recorded on-chain: ${assignmentTxHash}`);

        // Update job with assignment hash
        if (assignmentTxHash) {
          const updatedJob = await prisma.job.update({
            where: { id: job.id },
            data: {
              onChainAssignmentTxHash: assignmentTxHash,
            },
            select: {
              id: true,
              onChainAssignmentTxHash: true,
            },
          });
          console.log("Job assignment hash updated:", updatedJob);
        }
      } catch (assignError) {
        console.error("Failed to record job assignment:", assignError);
        // Continue with log recording even if assignment fails
      }
    } else {
      console.log(
        "Job already has assignment recorded:",
        job.onChainAssignmentTxHash
      );
    }

    // Record the job log
    let logTxHash: string | undefined;
    try {
      logTxHash = await safeService.recordJobLog(
        job.id,
        job.agent.safeAddress,
        status
      );
      console.log(`Job ${status} recorded on-chain: ${logTxHash}`);

      if (logTxHash) {
        // Get existing log
        const existingLog = await prisma.jobLog.findUnique({
          where: { id: logId },
        });

        if (existingLog) {
          // Update log with transaction hash only
          const updatedLog = await prisma.jobLog.update({
            where: { id: logId },
            data: {
              onChainTxHash: logTxHash,
            },
            select: {
              id: true,
              onChainTxHash: true,
            },
          });
          console.log("Job log updated:", JSON.stringify(updatedLog));
        } else {
          console.error("Job log not found:", logId);
        }
      }
    } catch (logError) {
      console.error("Failed to record job log:", JSON.stringify(logError));
    }

    return {
      assignmentTxHash: assignmentTxHash,
      logTxHash: logTxHash,
    };
  } catch (error) {
    console.error(`Error in recordJobOnChain:`, JSON.stringify(error));
    return {};
  }
}

/**
 * Records a job log status on-chain (without assignment)
 */
export async function recordJobLogOnChain(
  job: JobWithAgent,
  status: JobLogStatus,
  logId: string
): Promise<string | undefined> {
  // Skip if agent doesn't have a Safe wallet
  if (!job.agent?.safeAddress) {
    console.log("Skipping on-chain recording: agent has no Safe wallet");
    return undefined;
  }

  try {
    // Verify log exists before update
    const existingLog = await prisma.jobLog.findUnique({
      where: { id: logId },
    });

    if (!existingLog) {
      console.error(`Job log not found: ${logId}`);
      return undefined;
    }

    console.log("Found existing log:", {
      logId,
      currentTxHash: existingLog.onChainTxHash,
      status: existingLog.status,
    });

    // Record on-chain
    const txHash = await safeService.recordJobLog(
      job.id,
      job.agent.safeAddress,
      status
    );

    if (!txHash) {
      console.log("No transaction hash returned from recordJobLog");
      return undefined;
    }

    console.log(`Job ${status} recorded on-chain: ${txHash}`);

    try {
      // Update job log with transaction hash only
      const updatedLog = await prisma.jobLog.update({
        where: { id: logId },
        data: {
          onChainTxHash: txHash,
        },
        select: {
          id: true,
          onChainTxHash: true,
        },
      });

      console.log("Job log updated:", JSON.stringify(updatedLog));
      return txHash;
    } catch (dbError) {
      console.error(
        "Database update failed:",
        JSON.stringify({
          error: dbError,
          logId,
          txHash,
        })
      );
      return undefined;
    }
  } catch (error) {
    console.error(`Error recording job log on-chain:`, JSON.stringify(error));
    return undefined;
  }
}
