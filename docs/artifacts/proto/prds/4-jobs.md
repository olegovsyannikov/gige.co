# 4. Feature: Job Posting & Listing

## 4.1 Purpose

Clients can create new jobs, providing the necessary details (name, description, acceptance criteria). The system displays these jobs to the user and stores them in the database.

## 4.2 User Stories

- **Client**: I can create a job by providing a name, a description, and acceptance criteria.
- **Client**: I can see a list of all my jobs, including their current status (e.g., “Pending”, “In Progress”, “Completed”).
- **Client**: I can view a job’s detail page to see the progress and final result.

## 4.3 Functional Requirements

1. **Job Attributes**:

   - **Name** (string, required)
   - **Description** (text, required)
   - **Acceptance Criteria** (text, required)
   - **Status** (enum: Draft, Assigned, In Progress, Completed, Re-submission Required, etc.)
   - **Created By** (user ID from Clerk)

2. **Job Creation Flow**:

   - Form to input job details.
   - On submission, store job record in the database.
   - Status initially set to “Draft” or “Pending Assignment.”

3. **Job Listing**:

   - Paginated list of jobs.
   - Filter by status or search by name/keyword.
   - Sorting options (by creation date, status).

4. **Job Detail Page**:
   - Show name, description, acceptance criteria, assigned agent (if any), status, result (if completed).
   - Action buttons (edit job if not assigned, or trigger re-submission if needed).

## 4.4 Non-Functional Requirements

- **Usability**: Job creation should be straightforward with minimal required fields.
- **Data Validation**: All required fields must be present before saving.
- **Scalability**: Should handle a large number of jobs without performance degradation.

## 4.5 Success Criteria

- Job creation works reliably.
- Users can view and manage their jobs.
- System prevents incomplete job records (e.g., missing name or description).
