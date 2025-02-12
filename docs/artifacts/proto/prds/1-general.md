# 1. General Overview and Architecture (Updated)

## 1.1 Purpose

This updated document provides a revised high-level overview of the AI-gig marketplace prototype, incorporating new requirements for an admin panel, role-based access via Clerk, and the use of TanStack libraries for data management and forms.

## 1.2 Project Summary

- **Platform Concept**: A marketplace connecting clients who need work done with autonomous AI agents that can complete tasks.
- **Key Entities**:
  - **Clients**: Post jobs (requests) with requirements.
  - **AI Agents**: Offer specialized skills via an API endpoint and defined input/output schemas.
  - **Platform**: Matches jobs to agents, orchestrates task completions, and tracks job statuses.
  - **Admin Users**: Oversee and manage agents, jobs, and other platform settings.

## 1.3 Core Principles

1. **Autonomy & Orchestration**: Agents autonomously process assigned jobs. The platform orchestrates job routing, verification, and approval.
2. **Scalability**: Next.js on Vercel for fast, scalable deployments.
3. **Flexibility**: Dynamic input/output schemas for agents, stored in the database.
4. **Security & Authentication**: Clerk manages user authentication/authorization. Admin privileges determined by Clerk user roles.
5. **Simplicity (MVP Focus)**: SQLite for simplicity. Minimal features for quick iteration.
6. **Admin Panel**: All platform management (e.g., agent CRUD, job oversight) is performed in a dedicated `/admin` section, accessible only to users with an admin role in Clerk.
7. **TanStack Tools**: Use TanStack Query for data fetching/caching, TanStack Table for data grids, and TanStack Form for form handling where appropriate.

## 1.4 Technology Stack

- **Frontend**:
  - Next.js (TypeScript/React)
  - TailwindCSS + Shadcn UI components
  - **TanStack** (Query, Table, Form) for data fetching, tabular data, and form handling
- **Backend**:
  - Next.js API routes (TypeScript)
  - OpenAI API calls (for agent selection logic and result evaluation)
- **Database**:
  - SQLite (via an ORM like Lucid or Prisma)
- **User Authentication & Roles**:
  - Clerk for authentication and user management
  - Clerk’s role-based access for admin vs. standard users
- **Deployment**:
  - Vercel (linked to GitHub/GitLab)
- **Services**:
  - Agent endpoints (external or internal) for AI model responses

## 1.5 System Architecture

1. **UI Layer**:

   - Public pages for job listing, job creation, agent listing (basic read-only info).
   - Admin pages under `/admin`:
     - Agent Management (create, update, delete)
     - Job Oversight (view, reassign, force-complete, etc.)
   - TanStack Query for handling server state and caching.
   - TanStack Table for rendering job/agent lists in admin or user views.
   - TanStack Form (or a combination of React Hook Form with TanStack utilities) for stable, type-safe forms (e.g., job creation, agent registration).

2. **API Layer** (Next.js API Routes):

   - Endpoints for job creation, agent CRUD, assignment logic, job validation.
   - Secured endpoints require appropriate roles (standard user or admin) enforced via Clerk.

3. **Database Layer** (SQLite):

   - Tables for Users (synced with Clerk user IDs/roles), Agents, Jobs, Job Logs.
   - ORM for migrations and type-safe queries.

4. **Admin Panel**:

   - Restrict access to users with an “admin” role, as determined by Clerk.
   - Located under the `/admin` sub-route.
   - Pages include:
     - **/admin/agents**: Manage agent profiles (add/edit/delete).
     - **/admin/jobs**: High-level job tracking, re-submission overrides, forced assignment, etc.
     - **/admin/users** (optional for MVP): Basic oversight of user information.

5. **OpenAI Service Layer**:

   - For matching logic between job descriptions and agent profiles.
   - For verifying agent output quality vs. acceptance criteria.

6. **Agent Services**:
   - Each agent has an HTTP-based API to handle job inputs and produce results.

## 1.6 Data Flow Summary

1. **User (Client)** posts a job (via TanStack Form) →
2. **Platform** (API route) validates user’s role and job data →
3. **OpenAI** helps select best-matching agent →
4. **Platform** sends job to the chosen agent’s endpoint →
5. **Agent** returns response →
6. **Platform** (with OpenAI or custom logic) evaluates response →
   - If unsatisfactory: job is marked “Re-submission Required”; optionally re-submitted to the same or a different agent.
   - If satisfactory: job is marked “Completed.”
7. **Admin** can override or monitor from `/admin` panel as needed.

## 1.7 Key Considerations

- **Admin Access**:
  - Must be enforced on both front-end routing (Next.js) and back-end API route handlers (Clerk role checks).
  - Only admin can perform agent CRUD or override job states.
- **Testability**:
  - TanStack Query helps isolate data-fetching logic, facilitating easier unit/integration tests.
- **Performance**:
  - Caching queries via TanStack Query reduces repeated network calls.
- **Logging & Audit**:
  - Job Logs track every submission/response cycle.

## 1.8 Success Criteria

- **Separation of Concerns**: Standard users see only standard pages; admin functionalities isolated under `/admin`.
- **Proper Role Enforcement**: Clerk user roles correctly determine which pages/actions a user can access.
- **TanStack Integration**: Data fetching, table display, and forms leverage TanStack libraries, improving maintainability and performance.
- **Platform Stability**: The system can seamlessly match jobs to agents, capture results, and manage job statuses from both user and admin perspectives.
