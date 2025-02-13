# 5. Feature: Intelligent Agent Matching & Assignment

## 5.1 Purpose

When a new job is posted or updated, the platform automatically determines the best agent based on the job’s requirements and each agent’s profile. **OpenAI** is used to refine the matching process. This updated version explicitly requires a dedicated service (using TanStack Query) to invoke OpenAI’s endpoints, ensuring a clean separation of concerns and secure, centralized API calls.

## 5.2 User Stories

- **Client (User)**: I post a job and expect the platform to assign it to the most suitable agent.
- **System (OpenAI Integration)**: It uses a dedicated “OpenAI Matching Service” to rank or select the best agent.
- **Admin**: Can override assignments in the `/admin/jobs` panel, but the default flow uses OpenAI for the initial match.

## 5.3 Functional Breakdown

### 5.3.1 Backend

1. **API Endpoint** for Matching (e.g., `/api/openai/match`):

   - Receives the job description and the list of agent profiles (keywords, capabilities).
   - Calls OpenAI API with a structured prompt to find the best match.
   - Returns the ID or array of recommended agents in descending order of suitability.

2. **Job Creation Flow**:

   - When a job is created (`POST /api/jobs`), the server (or a serverless function) internally calls `/api/openai/match`.
   - The best matching agent ID is determined, then stored in the `assignedAgentId` field on the `jobs` table.

3. **Access Control**:
   - Only authenticated requests can trigger the matching.
   - The OpenAI API key is kept on the server side to avoid exposing it in the client.

### 5.3.2 Frontend (User)

- The standard user has no direct control over the OpenAI matching step; it happens automatically when they submit the “Create Job” form.
- **TanStack Query**:
  - A custom hook (e.g., `useMatchAgent`) could be used if matching is triggered from the frontend.
  - In most cases, job creation calls an internal endpoint (`/api/jobs`) which in turn calls the matching endpoint.
  - The results of matching (i.e., assignedAgentId) are reflected in the job details after job creation.

### 5.3.3 Frontend (Admin)

- **Location**: `/admin/jobs`
  - Admin can see which agent was assigned automatically.
  - Admin can override the assigned agent via a separate “Override Assignment” action.

## 5.4 Dedicated OpenAI Matching Service (via TanStack Query)

- **Service**: A React hook or a service module encapsulating all calls to `/api/openai/match`.
- **Usage**:
  - On the **server side**, the job creation endpoint invokes the matching service.
  - On the **client side**, if an override or a re-match is triggered in the admin panel, the same service can be used to re-run the match logic.
- **Caching & Error Handling**:
  - If repeated matching calls are needed, TanStack Query can cache results.
  - Handle errors gracefully (e.g., OpenAI downtime or invalid prompts).

## 5.5 Non-Functional Requirements

- **Security**:
  - The OpenAI API key is stored securely on the server.
  - All calls to the OpenAI endpoint happen on the server or through a protected API route.
- **Performance**:
  - Use minimal prompt lengths, and consider caching agent data to reduce repeated lookups.
- **Reliability**:
  - Fallback logic if OpenAI matching fails (assign a default agent or leave the job unassigned).
- **Traceability**:
  - Record each matching attempt in logs (job_logs) for debugging.

## 5.6 Success Criteria

- **Automatic Matching**: New jobs consistently get a relevant agent without user intervention.
- **Secure Integration**: The OpenAI API key is not exposed; calls are made through a dedicated, secure service.
- **Admin Override**: Admin can override assignments in `/admin/jobs`.
- **Seamless UX**: The user sees their job with an assigned agent soon after submission.
