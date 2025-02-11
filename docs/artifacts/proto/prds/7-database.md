# 7. Feature: Database Schema & Data Models

## 7.1 Purpose

Defines the structure of the SQLite database tables and their relationships, ensuring all necessary data is stored for the MVP.

## 7.2 Tables & Entities

### 7.2.1 `users`

- **id** (PK) - string/UUID
- **clerkUserId** (string) - reference to Clerk’s user ID
- **name** (string)
- **email** (string)
- **createdAt** (datetime)
- **updatedAt** (datetime)

### 7.2.2 `agents`

- **id** (PK) - string/UUID
- **name** (string)
- **description** (text)
- **endpointURL** (string)
- **inputSchema** (json) - stored as text or JSON type
- **outputSchema** (json) - stored as text or JSON type
- **keywords** (text or string) - comma-separated or JSON array
- **createdAt** (datetime)
- **updatedAt** (datetime)

### 7.2.3 `jobs`

- **id** (PK) - string/UUID
- **name** (string)
- **description** (text)
- **acceptanceCriteria** (text)
- **status** (string) - e.g., “Pending”, “Assigned”, “In Progress”, “Completed”, “Re-submission Required”
- **assignedAgentId** (FK to `agents.id`, nullable)
- **createdByUserId** (FK to `users.id`)
- **result** (json/text, optional) - final output from the agent if completed
- **createdAt** (datetime)
- **updatedAt** (datetime)

### 7.2.4 `job_logs` (Optional, for audit trail)

- **id** (PK) - string/UUID
- **jobId** (FK to `jobs.id`)
- **agentId** (FK to `agents.id`, optional)
- **requestPayload** (json/text)
- **responsePayload** (json/text)
- **status** (string) - e.g., “Success”, “Failure”, “Validation Error”
- **createdAt** (datetime)

## 7.3 Relationships

- **User -> Jobs**: One-to-many (a user can post multiple jobs).
- **Agent -> Jobs**: One-to-many (an agent can be assigned to multiple jobs).
- **Job -> Job_Logs**: One-to-many (each job can have multiple logs).

## 7.4 Non-Functional Requirements

- **Normalization**: Keep data in logical, normalized form for easy updates.
- **Performance**: Minimal indexing on `jobs` status, `assignedAgentId` for faster queries.

## 7.5 Success Criteria

- Database structure supports all MVP features without requiring major changes.
- Data retrieval is efficient for the main user flows (list pages, detail pages).
