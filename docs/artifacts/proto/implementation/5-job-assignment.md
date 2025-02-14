# Job Assignment Management Implementation

## Overview

The Job Assignment Management module provides functionality for managing job assignments to AI agents, including assignment, cancellation, and status tracking. It ensures proper handling of job state transitions and maintains a detailed audit log.

## Technical Implementation

### Components

1. **Job Management UI**

   - `JobActionButtons`: Controls for job actions (assign, cancel, resubmit)
   - `JobStatusBadge`: Visual indicator of job status
   - `JobLogItem`: Display of job execution history
   - `AlertDialog`: Confirmation dialogs for critical actions

2. **Assignment Controls**
   - Auto-assign with AI matching
   - Manual assignment with agent selection
   - Input generation toggle with form state management
   - Dynamic form fields based on agent schema
   - Assignment cancellation with confirmation
   - Status tracking and logging

### Form Handling

```typescript
interface FormValues {
  agentId: string;
  generateInput: boolean;
  [key: string]: string | number | boolean | unknown;
}

// Form Schema Generation
function createDynamicSchema(inputSchema: JsonSchema | undefined) {
  const shape = {
    agentId: z.string(),
    generateInput: z.boolean().default(true),
    // Dynamic fields based on agent schema
  };
  return z.object(shape);
}

// Form State Management
const form = useForm<FormValues>({
  resolver: zodResolver(createDynamicSchema(agent?.inputSchema)),
  defaultValues: {
    generateInput: true,
    agentId: "",
  },
});

// Form Reset Logic
useEffect(() => {
  if (selectedAgent) {
    form.reset({
      agentId: selectedAgent.id,
      generateInput: currentValue,
      // Reset other fields while preserving state
    });
  }
}, [selectedAgent]);
```

### Data Models

```prisma
enum JobStatus {
  PENDING
  ASSIGNED
  IN_PROGRESS
  COMPLETED
  FAILED
  REJECTED
  RESUBMISSION_REQUIRED
}

enum JobLogStatus {
  PENDING
  ASSIGNED
  IN_PROGRESS
  COMPLETED
  FAILED
  REJECTED
  RESUBMISSION_REQUIRED
  CANCELLED
  MATCHING_FAILED
}

model JobLog {
  id              String       @id @default(cuid())
  jobId           String
  agentId         String?
  requestPayload  Json?
  responsePayload Json?
  status          JobLogStatus
  message         String?
  createdAt       DateTime     @default(now())
  job             Job          @relation(fields: [jobId], references: [id])
  agent           Agent?       @relation(fields: [agentId], references: [id])
}
```

### API Layer

1. **Assignment Endpoints**

   - `POST /api/jobs/[id]/auto-assign`: AI-based agent matching
   - `POST /api/jobs/[id]/assign`: Manual agent assignment
   - `POST /api/jobs/[id]/cancel`: Cancel current assignment

2. **Input Generation**
   - AI-based input generation from job description
   - Schema validation for generated inputs
   - Fallback to manual inputs when auto-generation is disabled
   - Validation against agent input schema

### Services

```typescript
// Job Assignment Service
export const jobAssignmentApi = {
  autoAssign: (jobId: string) => Promise<void>,
  manualAssign: (jobId: string, agentId: string, inputs: unknown) => Promise<void>,
  cancel: (jobId: string) => Promise<void>,
};

// React Query Hooks
export const {
  useJob,
  useJobLogs,
  useAutoAssign,
  useManualAssign,
  useCancelAssignment,
} = ...;
```

## Current Status

- ✅ Auto-assignment with AI matching
- ✅ Manual assignment with input validation
- ✅ Auto-generation toggle with form state persistence
- ✅ Assignment cancellation
- ✅ Status tracking and logging
- ✅ Dynamic form fields with proper state management
- ⏳ Assignment retry logic
- ❌ Batch operations
- ❌ Advanced validation rules

## Technical Decisions

1. **Form State Management**

   - Zod schema for form validation
   - Dynamic schema generation based on agent
   - State persistence during agent switches
   - Proper handling of disabled fields

2. **Input Generation**

   - Toggle between auto and manual input
   - AI-based generation with validation
   - Schema-based validation for both modes
   - Proper error handling and feedback

3. **Error Handling**
   - Validation errors for manual inputs
   - Generation failures for auto mode
   - Schema validation errors
   - User-friendly error messages

## Known Issues

1. Limited retry logic for failed assignments
2. Basic input validation
3. No batch operations support
4. Missing advanced validation rules

## Future Improvements

1. **Features**

   - Preview of generated inputs
   - Input template system
   - Batch assignment operations
   - Enhanced validation rules

2. **Integration**
   - Webhook notifications
   - External system integration
   - Advanced metrics tracking

---

Last Updated: 2025-02-14
Version: 0.4.2
