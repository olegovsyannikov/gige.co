# 4. Feature: Job Posting & Listing (Updated)

## 4.1 Purpose

Clients can create new jobs, providing a name, description, and acceptance criteria. **All users** can see public job listings (but can only see details of jobs they own if desired). **Admins** can view or manage all jobs in the admin panel at `/admin/jobs`.

## 4.2 User Stories

- **Client (User)**: I can create a job by providing a name, description, and acceptance criteria.
- **Client (User)**: I can see a list of my jobs along with their current status (e.g., “Pending”, “Assigned”).
- **Client (User)**: I can view a job’s detail page to see progress and final result.
- **Admin**: I can see all jobs in an admin overview, filter or search them, and potentially override or update status if needed.

## 4.3 Functional Breakdown

### 4.3.1 Backend

- **API Endpoints** (e.g., `/api/jobs`):
  - **Create Job (POST)**: Creates a new job for an authenticated user.
  - **List Jobs (GET)**: Returns a paginated list of jobs.
    - If user is standard, return only that user’s jobs (or public listings if we allow public read).
    - If user is admin, return all jobs or a suitable subset based on admin query.
  - **Read/Update Job Details (GET/PUT/PATCH)**:
    - For standard users, only allow reading or updating jobs they created (unless the job is open/public).
    - For admins, allow reading/updating any job.
- **Data Validation**:
  - Enforce required fields (name, description, acceptance criteria).

### 4.3.2 Frontend (User)

- **Location**:
  - `/jobs`: List of all jobs the user can see.
  - `/jobs/new`: Form to create a new job.
  - `/jobs/[jobId]`: Detail page for a specific job.
- **Features**:
  - **Job Listing**: TanStack Table can be used to display the user’s jobs.
  - **Job Creation Form**: TanStack Form to handle job creation with fields (name, description, acceptance criteria).
  - **Job Details**: Show status, assigned agent (if any), final result once completed.

### 4.3.3 Frontend (Admin)

- **Location**: `/admin/jobs`
- **Features**:
  - **Full Job Listing**: Admin can see all jobs in a table.
  - **Filters/Sort**: Possibly by status, user, assigned agent, etc.
  - **Job Detail Management**: Admin can override job statuses if needed (e.g., force re-submission or completion).
  - **Data Fetching**: Uses TanStack Query to retrieve all jobs with admin privileges.

## 4.4 Non-Functional Requirements

- **Usability**: Simple forms for job creation; minimal friction.
- **Security**: Clerk-based role checks so standard users cannot access admin routes or manipulate other users’ jobs.
- **Scalability**: Support large numbers of jobs with table pagination or infinite scroll.

## 4.5 Success Criteria

- Users can reliably create and manage their own jobs in `/jobs`.
- Admins can see and manage all jobs in `/admin/jobs`.
- Data is validated and persisted in the database with correct user associations.
