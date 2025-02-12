# 3. Feature: Agent Management (Updated)

## 3.1 Purpose

Enables the creation, modification, and viewing of AI agent profiles. Each agent has an API endpoint, input schema, and output schema that define how the agent processes a task. **All managerial actions (create, update, delete) are performed by admins via the `/admin` interface**, while standard users can only view publicly available agent details.

## 3.2 User Stories

- **Admin**: I can create, edit, and delete AI agent records from the admin panel at `/admin/agents`.
- **Admin**: I can define an agent’s name, description, endpoint URL, input schema, output schema, and capabilities (keywords) for matching.
- **User/Client**: I can view a list of available agents (read-only) and see each agent’s public profile to understand its capabilities.

## 3.3 Functional Breakdown

### 3.3.1 Backend

- **API Endpoints** (e.g., `/api/admin/agents`):
  - **Create Agent (POST)**: Accepts new agent details (name, endpoint, schemas, etc.).
  - **Read Agents (GET)**: Fetch agent list or a single agent’s info.
  - **Update Agent (PUT/PATCH)**: Modify existing agent data.
  - **Delete Agent (DELETE)**: Remove an agent record (soft-delete or permanent).
  - Access to these endpoints should be restricted to admin users (check Clerk roles on the server side).
- **Data Validation**:
  - Validate endpoint URL format, JSON schemas for input/output, required fields, etc.
- **Agent Activity Logging**:
  - Potentially store usage stats, job count, response times.

### 3.3.2 Frontend (Admin)

- **Location**: `/admin/agents`
- **Features**:
  - **Agent List**: A table (using TanStack Table) showing all agents.
  - **Create/Edit Forms**: A form (using TanStack Form or compatible library) to add or update an agent’s details.
  - **Delete Action**: Button or menu option in the list/table to remove an agent.
  - **Data Fetching**: TanStack Query to fetch and cache agent data from the backend.

### 3.3.3 Frontend (User)

- **Location**: `/agents` (read-only list of agents)
- **Features**:
  - **Agent List**: Displays an overview of agent capabilities (name, description, tags/keywords).
  - **Agent Details**: Clicking an agent might show a detail page with read-only fields (endpoint URL may be hidden if sensitive).

## 3.4 Non-Functional Requirements

- **Security**:
  - Clerk role-based checks on the server for any create/update/delete actions.
  - Admin routes in the frontend only accessible if the user is verified as an admin.
- **Scalability**:
  - The system must handle multiple agents with potentially large schemas.
- **Performance**:
  - Listing agents should be efficient (TanStack Query caching + server-side pagination if needed).

## 3.5 Success Criteria

- Admins can successfully create/update/delete agents via `/admin/agents`.
- Standard users can only view agent profiles in read-only mode.
- All agent data is validated and securely stored in the database.
