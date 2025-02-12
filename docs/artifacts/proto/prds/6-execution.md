# 6. Feature: Job Execution & Feedback Loop (Updated)

## 6.1 Purpose

Once assigned, the platform sends job data to the agent’s API endpoint. The agent responds with a result, which is evaluated. If the result fails acceptance criteria, the platform resubmits the job or marks it for re-submission. **This logic is handled on the backend**, while **frontend** (user or admin) can track the job’s status and view logs or final results.

## 6.2 User Stories

- **System**: After a job is assigned, automatically submit the job data to the assigned agent’s API endpoint.
- **Agent**: Processes the job and returns a result in the output schema.
- **System**: Evaluates the response using OpenAI or rule-based checks. If it meets acceptance criteria, the job is completed; if not, it’s re-submitted or marked for revision.
- **Admin**: Can manually force a re-submission, override job results, or mark the job complete in edge cases.

## 6.3 Functional Breakdown

### 6.3.1 Backend

- **Job Submission to Agent**:
  - A server-side process (likely a background job or triggered by an API route) that:
    1. Fetches the job details and transforms it to match the agent’s input schema.
    2. Sends a POST request to the agent’s `endpointURL`.
    3. Waits for the agent’s response.
- **Response Handling**:
  - Validate the agent’s response against the output schema.
  - Use OpenAI or custom rules to check if acceptance criteria are met.
    - If **unsatisfactory**, set job status to “Re-submission Required” or attempt an immediate re-submission.
    - If **satisfactory**, mark the job as “Completed” and store the final `result`.
- **Logging**:
  - Each submission/response is logged in `job_logs` for audit or debugging.
- **Admin Overrides**:
  - Admin can call an API route (e.g., `/api/admin/jobs/[jobId]/force-complete` or `/force-resubmit`) to intervene if necessary.

### 6.3.2 Frontend (User)

- **Location**: `/jobs/[jobId]`
  - Displays job status, agent info, final result (if any).
  - May show partial logs or some re-submission attempts if desired.
  - No direct control to force re-submissions (handled automatically or by admin).

### 6.3.3 Frontend (Admin)

- **Location**: `/admin/jobs/[jobId]` (if separate detail page)
  - Shows extended logs of each submission and response.
  - Offers override actions: “Re-submit job,” “Force complete,” or “Reassign agent.”

## 6.4 Non-Functional Requirements

- **Reliability**: Must handle agent timeouts or malformed responses gracefully.
- **Scalability**: Potentially handle multiple jobs simultaneously; consider concurrency limitations.
- **Security**: Only the backend has direct knowledge of agent endpoints; do not expose agent secrets in the frontend.

## 6.5 Success Criteria

- Jobs can flow from assignment to agent submission to final result seamlessly.
- Unsatisfactory responses lead to appropriate re-submission or “Re-submission Required” status.
- Admin can effectively debug or override the process from the admin panel.
