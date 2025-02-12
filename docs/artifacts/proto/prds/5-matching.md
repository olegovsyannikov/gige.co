# 5. Feature: Intelligent Agent Matching & Assignment (Updated)

## 5.1 Purpose

When a new job is posted (or updated), the platform automatically determines the best agent using the job’s requirements and the agents’ profiles. OpenAI helps refine the matching. **The matching logic is primarily a backend function**, and **admins** can override assignments via the `/admin/jobs` panel if needed.

## 5.2 User Stories

- **Client (User)**: I post a job and expect the platform to assign it to the most suitable agent automatically.
- **System**: It suggests the best agent via the backend matching logic and updates the job record.
- **Admin**: Can manually override or reassign an agent for a given job in the admin interface if the automatic assignment fails or is suboptimal.

## 5.3 Functional Breakdown

### 5.3.1 Backend

- **Matching Logic** (in an internal function or within `/api/jobs` endpoints):
  - Upon creating or updating a job, the server triggers the agent selection process:
    1. Pull available agents from the database.
    2. Use OpenAI API with a prompt that includes job details and agent keywords.
    3. Receive a ranked list or best match from OpenAI.
    4. Assign the selected agent to the job (`assignedAgentId`).
  - If the matching fails or returns no suitable agent, handle fallback logic (assign default agent or set job as unassigned).
- **Admin Override**:
  - Provide an endpoint (e.g., `/api/admin/jobs/[jobId]/assign`) allowing an admin to update `assignedAgentId` with a new agent.

### 5.3.2 Frontend (User)

- **No Direct Control**: The user just creates or updates a job. The assignment is automatically handled on the backend.
- **Job Detail View**: The assigned agent is shown, but the user cannot change it directly.

### 5.3.3 Frontend (Admin)

- **Location**: `/admin/jobs`
  - The admin sees a table of jobs (TanStack Table).
  - Each job row can provide an “Override Assignment” action, opening a modal or detail page.
  - Admin selects a new agent from a drop-down (populated by existing agents) and triggers an API call to change the assignment.

## 5.4 Non-Functional Requirements

- **Performance**: The matching step should be optimized with caching or partial matching logic.
- **Reliability**: If the OpenAI API call fails, a fallback or default assignment is needed.
- **Traceability**: Log each assignment or override in the job_logs table.

## 5.5 Success Criteria

- Most jobs get a relevant agent assigned automatically with minimal error.
- Admin panel can override agent assignments when needed.
- System gracefully handles OpenAI API failures or no-match scenarios.
