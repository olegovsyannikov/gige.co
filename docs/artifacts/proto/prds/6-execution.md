# 6. Feature: Job Execution & Feedback Loop

## 6.1 Purpose

Once a job is assigned to an agent, the platform waits for a **manual "Execute" action** from the user (or admin). When the user presses the **"Execute"** button, the system sends the job data to the agent’s API endpoint, receives the response, and uses OpenAI to validate the result against acceptance criteria. All requests (to the agent and the validator) are logged in the job logs for complete traceability.

## 6.2 User Stories

- **Client (User)**: After creating or editing a job, and once it has an assigned agent, I see an **"Execute"** button. Pressing it triggers the backend to run the job through the agent, then validate results.
- **System**: Submits the job to the assigned agent, evaluates the response via OpenAI, and updates the job’s status accordingly.
- **Admin**: Can also press **"Execute"** in the admin panel to force a re-run or re-submission if needed.

## 6.3 Functional Breakdown

### 6.3.1 Job States Overview

1. **Pending**: The job is created but not yet assigned an agent.
2. **Assigned**: An agent is assigned to the job; the job is “active” but not yet executed.
3. **In Execution**: The user (or admin) has pressed **"Execute"**, and the system is currently sending the request to the agent and validating the result.
4. **Re-submission Required**: The job was executed, but the result failed validation. The user or admin must correct or re-try.
5. **Completed**: The result is validated and accepted.

### 6.3.2 Backend

1. **"Execute" Job Endpoint** (e.g., `POST /api/jobs/[jobId]/execute`):

   - **Request**:
     - Contains the `jobId` in the URL.
     - Verifies the job’s status is “Assigned” or “Re-submission Required” before proceeding.
   - **Flow**:
     1. Update job status to **"In Execution"**.
     2. Send a request to the assigned agent’s `endpointURL`:
        - Transform job data into agent’s input schema.
        - Log this request to `job_logs` (including timestamp, payload).
     3. Receive and parse the agent’s response:
        - Validate it against the agent’s output schema.
        - Log this response to `job_logs` (timestamp, payload).
     4. Call OpenAI (or custom validator) to check if the agent’s output meets acceptance criteria:
        - Log this request/response to `job_logs`.
        - If **pass**, set job status to **"Completed"**, store final `result`.
        - If **fail**, set job status to **"Re-submission Required"**.
   - **Response**: Returns the updated job object (including new status and result, if successful).

2. **Job Logging**:
   - Every request to the agent endpoint and every request to the OpenAI validation service is recorded in the `job_logs` table:
     - `jobId`, `timestamp`, `type` (agent_request, agent_response, validator_request, validator_response), `payload`, `status`.

### 6.3.3 Frontend (User)

- **Location**: `/jobs/[jobId]`
  - When the job’s status is **"Assigned"** or **"Re-submission Required"**, display an **"Execute"** button.
  - Clicking **"Execute"** calls the `executeJob` function (a TanStack Query mutation) that hits `/api/jobs/[jobId]/execute`.
  - The page listens for the API response; upon success:
    - If the job status becomes **"Completed"**, show the final result.
    - If **"Re-submission Required"**, prompt the user that the job failed validation and can be retried or edited.

### 6.3.4 Frontend (Admin)

- **Location**: `/admin/jobs/[jobId]` (or within the jobs table actions)
  - Admin has the same **"Execute"** button to run or re-run the job.
  - Additionally, the admin might see extended logs or override actions (force assign, force complete, etc.).

## 6.4 Non-Functional Requirements

- **Reliability**:
  - If agent endpoint fails or times out, the system should handle gracefully (job remains “Assigned” or returns to “Re-submission Required”).
  - If OpenAI call fails, the system logs an error and the job remains “In Execution” until retried or fails safely.
- **Traceability**:
  - All requests (agent and validator) are stored in `job_logs`.
  - Status changes (Pending → Assigned → In Execution → Completed / Re-submission Required) are easily reviewable in the logs.
- **Performance**:
  - The job execution is synchronous or asynchronous depending on implementation (serverless function or background job).
  - The UI should display a loading state while “Execute” is in progress.

## 6.5 Success Criteria

- **Manual Execution**: Users or admins can trigger job execution by pressing **"Execute"**.
- **Logging**: Every request to the agent endpoint and OpenAI validator is recorded in `job_logs`.
- **Accurate Status Updates**: The job’s status transitions correctly from “Assigned” → “In Execution” → “Completed” or “Re-submission Required.”
- **User-Friendly**: The page updates with the final result or a notice that a re-submission is needed, providing clear feedback.
- **Admin Oversight**: Admin can see logs and re-run jobs if necessary from the admin panel.
