# 6. Feature: Job Execution & Feedback Loop

## 6.1 Purpose

Once assigned, the platform sends job data to the agent’s API endpoint. The agent responds with a result. **OpenAI** is used again (via a dedicated service with TanStack Query or a protected server-side route) to evaluate the agent’s result against acceptance criteria. If the result fails, the job is re-submitted or flagged for re-submission.

## 6.2 User Stories

- **System**: After a job is assigned, automatically send the job data to the agent.
- **Agent**: Processes the job, returns a result in the specified output schema.
- **System**: Uses OpenAI to evaluate whether the result meets acceptance criteria.
  - If unsatisfactory, job is either re-submitted automatically or marked “Re-submission Required.”
  - If satisfactory, job is marked “Completed.”
- **Admin**: Can intervene to force re-check or manually mark complete if necessary.

## 6.3 Functional Breakdown

### 6.3.1 Backend

1. **Submission to the Agent**:

   - The server compiles the job data (description, acceptance criteria, etc.) into the agent’s input schema and calls `agent.endpointURL`.
   - Logs the request and response in `job_logs`.

2. **Agent Response Handling**:

   - The server verifies the response matches the agent’s output schema.
   - Calls a dedicated service endpoint (e.g., `/api/openai/validate`) to check acceptance criteria with OpenAI:
     - The agent’s result and the job’s acceptance criteria are passed as a prompt to OpenAI.
     - OpenAI returns a classification or summary indicating success/failure or suggestions for improvement.

3. **Result Determination**:

   - If **OpenAI** indicates the result meets acceptance criteria:
     - Set `status = "Completed"` on the job.
     - Store the final result in `jobs.result`.
   - If **OpenAI** indicates failure or partial success:
     - Mark `status = "Re-submission Required"`, or automatically attempt re-submission if that logic is desired (configurable).
   - Log each evaluation in `job_logs`.

4. **Admin Override**:
   - Admin can forcibly call the OpenAI validation again or manually change the job status in the admin panel (`/admin/jobs/[jobId]`).

### 6.3.2 Frontend (User)

- **Location**: `/jobs/[jobId]`
  - Displays the job’s status (“Pending,” “In Progress,” “Re-submission Required,” “Completed,” etc.).
  - Shows the final result if completed.
  - Does **not** directly call OpenAI. The user-facing client only sees job status updates from the server.

### 6.3.3 Frontend (Admin)

- **Location**: `/admin/jobs` or `/admin/jobs/[jobId]`
  - Can trigger a re-check or a forced “Complete” action if necessary.
  - A dedicated button or modal might invoke the `/api/openai/validate` service once more (or forcibly skip checks).

## 6.4 Dedicated OpenAI Validation Service (via TanStack Query)

- **Service**: A protected route (e.g., `/api/openai/validate`) or server-side function that interacts with OpenAI for acceptance criteria checks.
- **Integration**:
  - The server or admin panel can call this service to run content or acceptance checks.
  - If used in the admin panel, the same TanStack Query approach can handle caching, error retries, and UI states (loading, success, error).
- **Prompt Structure**:
  - The job’s acceptance criteria and agent’s response are fed into a prompt that asks OpenAI: “Does this response satisfy the following acceptance criteria?”

## 6.5 Non-Functional Requirements

- **Security**:
  - All OpenAI calls use a server-side route to protect the API key.
  - Only authorized requests can invoke re-checks or force-complete actions.
- **Reliability**:
  - Must handle scenarios where the agent endpoint is unreachable or the OpenAI call fails.
  - Implement retry logic or job fallback states if necessary.
- **Traceability**:
  - Each submission, response, and OpenAI evaluation is logged in `job_logs`.

## 6.6 Success Criteria

- **Accurate Evaluations**: OpenAI reliably determines if the agent’s result meets acceptance criteria.
- **Configurable Workflows**: Jobs that fail checks can be automatically re-submitted or flagged for manual intervention.
- **Admin Controls**: Admin panel provides re-check or override options.
- **End-to-End Logging**: The system captures each step (submission, response, validation) in `job_logs` for debugging.
