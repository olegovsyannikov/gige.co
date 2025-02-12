# 8. Feature: Frontend UI/UX and Pages (Updated)

## 8.1 Purpose

Provides a structured layout for **two main user-facing sections**:

1. **User Pages**: Standard users can register/login, create/view jobs, and see basic agent info.
2. **Admin Panel**: Under `/admin`, admins can manage agents, oversee all jobs, and perform overrides or advanced actions.

## 8.2 Main Pages

### 8.2.1 **User-Facing Pages**

1. **Home/Landing (Optional)**:
   - Could be `/` with a brief overview, sign-in link, or quick job listing.
2. **All Jobs** (`/jobs`):
   - Shows the user’s jobs in a table (TanStack Table).
   - “Create Job” button for authenticated users.
3. **Create Job** (`/jobs/new`):
   - TanStack Form for job creation (name, description, acceptance criteria).
4. **Job Details** (`/jobs/[jobId]`):
   - Displays job info, assigned agent, final results, and job status.
5. **All Agents** (`/agents`):
   - Read-only listing of agents, name, short description, keywords, etc.
6. **Agent Details** (`/agents/[agentId]`):
   - Display agent’s info for read-only. Possibly show a list of completed jobs if desired.

### 8.2.2 **Admin Pages** (Restricted to Clerk users with admin role)

1. **Admin Dashboard** (`/admin`):
   - Overview of system stats, quick links to manage agents and jobs.
2. **Agent Management** (`/admin/agents`):
   - Table listing of all agents (TanStack Table).
   - Create/Edit/Delete agent forms (TanStack Form).
3. **Jobs Management** (`/admin/jobs`):
   - List of all jobs (TanStack Table).
   - Ability to filter/search by status, agent, or user.
   - Admin overrides (re-assign, force re-submission, force complete).
4. **Job Details** (`/admin/jobs/[jobId]`) (optional detail page):
   - Extended logs, override controls, re-submission triggers.
5. **Optional**: `/admin/users` for managing user accounts or viewing user details.

## 8.3 Use of TanStack Libraries

- **TanStack Query**: For data fetching and caching from the Next.js API routes.
- **TanStack Table**: For job/agent listings with sorting, filtering, pagination.
- **TanStack Form** (or integrated approach with React Hook Form and TanStack libraries): For job creation/editing, agent CRUD forms.

## 8.4 Page Layout Components

- **Navbar**:
  - For user-facing pages: “Jobs,” “Agents,” “Profile,” “(Sign Out)”
  - For admins: A link to “Admin Panel” if the user’s role is `admin`.
- **Footer**: Basic branding or disclaimers (shared across user/admin).
- **Sidebar** (Optional for admin panel):
  - Quick links: “Agents,” “Jobs,” “Dashboard,” etc.

## 8.5 Non-Functional Requirements

- **Responsiveness**: UI must be mobile-friendly using TailwindCSS best practices.
- **Accessibility**: Ensure forms and interactive elements follow accessibility guidelines.
- **Security**:
  - Admin routes locked down to admin role in the frontend (via Clerk + role check).
  - Additional server-side checks to confirm admin status.
- **Performance**:
  - Use TanStack Query caching to avoid redundant requests.
  - SSR or static generation for certain pages if beneficial.

## 8.6 Success Criteria

- Users can intuitively navigate the site, create and view jobs without confusion.
- Admins have a clear, separate panel to manage agents and oversee all jobs.
- TanStack libraries improve performance (caching, table sorting) and maintainability.
- Pages are consistent in design (using Shadcn UI + TailwindCSS).
