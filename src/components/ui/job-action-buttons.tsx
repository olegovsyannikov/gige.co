import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Job } from "@prisma/client";

interface JobActionButtonsProps {
  job: Job;
  onAutoAssign?: () => Promise<void>;
  onManualAssign?: () => void;
  onResubmit?: () => Promise<void>;
  onComplete?: () => Promise<void>;
  onCancelAssignment?: () => Promise<void>;
}

export function JobActionButtons({
  job,
  onAutoAssign,
  onManualAssign,
  onResubmit,
  onComplete,
  onCancelAssignment,
}: JobActionButtonsProps) {
  const isPending = job.status === "PENDING";
  const isAssigned = job.status === "ASSIGNED";
  const isInProgress = job.status === "IN_PROGRESS";
  const needsResubmission = job.status === "RESUBMISSION_REQUIRED";

  return (
    <div className="flex flex-wrap gap-2">
      {isPending && (
        <>
          <Button
            variant="default"
            onClick={onAutoAssign}
            disabled={!onAutoAssign}
          >
            Auto-Assign
          </Button>
          <Button
            variant="outline"
            onClick={onManualAssign}
            disabled={!onManualAssign}
          >
            Manual Assign
          </Button>
        </>
      )}

      {isAssigned && onCancelAssignment && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Cancel Assignment</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Assignment?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the agent assignment and return the job to pending status.
                Are you sure you want to continue?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No, keep assignment</AlertDialogCancel>
              <AlertDialogAction onClick={onCancelAssignment}>
                Yes, cancel assignment
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {(needsResubmission || isAssigned) && (
        <Button
          variant="default"
          onClick={onResubmit}
          disabled={!onResubmit}
        >
          Resubmit
        </Button>
      )}

      {isInProgress && (
        <Button
          variant="default"
          onClick={onComplete}
          disabled={!onComplete}
        >
          Complete
        </Button>
      )}
    </div>
  );
}
