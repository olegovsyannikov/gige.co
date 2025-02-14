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
import { Job } from "@/types/job";

type ButtonState = "active" | "working" | "disabled";

interface JobActionButtonsProps {
  job: Job;
  onAutoAssign?: () => void;
  onManualAssign?: () => void;
  onCancelAssignment?: () => void;
  onExecute?: () => void;
}

const renderAutoAssignButton = (state: ButtonState, onClick?: () => void) => {
  return (
    <Button
      variant="default"
      onClick={onClick}
      disabled={state !== "active"}
    >
      {state === "working" ? (
        <>
          <span className="mr-2">Assigning...</span>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </>
      ) : (
        "Auto-Assign"
      )}
    </Button>
  );
};

const renderManualAssignButton = (state: ButtonState, onClick?: () => void) => {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={state !== "active"}
    >
      Manual Assign
    </Button>
  );
};

const renderExecuteButton = (state: ButtonState, onClick?: () => void) => {
  return (
    <Button
      variant="default"
      onClick={onClick}
      disabled={state !== "active"}
    >
      {state === "working" ? (
        <>
          <span className="mr-2">Executing...</span>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </>
      ) : (
        "Execute"
      )}
    </Button>
  );
};

const renderCancelAssignmentButton = (state: ButtonState, onClick?: () => void) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={state !== "active"}>
          {state === "working" ? (
            <>
              <span className="mr-2">Cancelling...</span>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </>
          ) : (
            "Cancel Assignment"
          )}
        </Button>
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
          <AlertDialogAction onClick={onClick}>
            Yes, cancel assignment
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export function JobActionButtons({
  job,
  onAutoAssign,
  onManualAssign,
  onCancelAssignment,
  onExecute,
}: JobActionButtonsProps) {
  const isPending = job.status === "PENDING";
  const isAssigned = job.status === "ASSIGNED";
  const needsResubmission = job.status === "RESUBMISSION_REQUIRED";

  const getButtonState = (handler?: () => void): ButtonState => {
    if (!handler) return "working";
    return "active";
  };

  return (
    <div className="flex flex-wrap gap-2">
      {isPending && (
        <>
          {renderAutoAssignButton(getButtonState(onAutoAssign), onAutoAssign)}
          {renderManualAssignButton(getButtonState(onManualAssign), onManualAssign)}
        </>
      )}

      {isAssigned && (
        <>
          {renderExecuteButton(getButtonState(onExecute), onExecute)}
          {renderCancelAssignmentButton(getButtonState(onCancelAssignment), onCancelAssignment)}
        </>
      )}

      {needsResubmission && (
        <>
          {renderExecuteButton(getButtonState(onExecute), onExecute)}
          {renderCancelAssignmentButton(getButtonState(onCancelAssignment), onCancelAssignment)}
        </>
      )}
    </div>
  );
}
