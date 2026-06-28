# Task Creation Implementation Plan

**User Answers:**
- UI Placement: Dedicated page (`/tasks/new`)
- Priority UI: Icon buttons (cycle through High/Medium/Low)
- Project Context: Required project selection
- Due Date UI: Inline within task creation
- Auth: Set up Better Auth first
- Form Fields: Full feature set (title, description, priority, due date, project)
- Description: Plain text
- Success Action: Redirect to task list
- Date Input: shadcn + date-fns
- Project Creation: Select only existing
- Component Strategy: Incremental install
- Component Structure: Field Component (shadcn UI recommended pattern)

---

## Phase 1: Prerequisites (Dependencies)

### 1.1 Better Auth Setup
**Files to create:**
- `src/lib/auth.ts` - Server-side auth configuration
- `src/lib/auth-client.ts` - Client-side auth configuration

**Required packages:**
```bash
bun add better-auth
```

**Environment variables (add to `.env.example`):**
- `BETTER_AUTH_SECRET` (32+ chars)
- `BETTER_AUTH_URL` (http://localhost:3000)

**Database schema:** Run Better Auth CLI generate to add user/session tables to Prisma schema.

### 1.2 Install Required Form Dependencies
```bash
bun add react-hook-form @hookform/resolvers date-fns
bunx shadcn add field input label select textarea button calendar popover
# Install calendar-related components incrementally
```

---

## Phase 2: Database Schema (Prisma)

### 2.1 Update `prisma/schema.prisma`
Add models for:
```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String?
  emailVerified Boolean
  createdAt     DateTime
  updatedAt     DateTime
  sessions      Session[]
  accounts      Account[]
  projects      Project[]
  tasks         Task[]
}

model Project {
  id        String   @id @default(uuid())
  name      String
  color     String   @default("#6366f1")
  ownerId   String
  owner     User     @relation(fields: [ownerId], references: [id])
  tasks     Task[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Task {
  id          String    @id @default(uuid())
  title       String
  description String?
  priority    Priority  @default(MEDIUM)
  dueDate     DateTime?
  completed   Boolean   @default(false)
  projectId   String
  project     Project   @relation(fields: [projectId], references: [id])
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  subtasks    Subtask[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Subtask {
  id        String   @id @default(uuid())
  title     String
  completed Boolean  @default(false)
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Priority {
  HIGH
  MEDIUM
  LOW
}
```

Run: `bun migrate` to apply schema.

---

## Phase 3: Validation Schema

### 3.1 Create `src/lib/zodSchema.ts`
```typescript
import { z } from "zod";

export const priorityEnum = z.enum(["HIGH", "MEDIUM", "LOW"]);

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(5000).optional(),
  priority: priorityEnum.default("MEDIUM"),
  dueDate: z.date().nullable().optional(),
  projectId: z.string().min(1, "Project is required"),
});

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;
```

---

## Phase 4: Server Action

### 4.1 Create `src/server/tasks.ts`
```typescript
"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/database/dbClient";
import { createTaskSchema } from "@/lib/zodSchema";

export async function createTask(values: CreateTaskFormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const validated = createTaskSchema.parse(values);
  
  // Verify project ownership
  const project = await prisma.project.findFirst({
    where: { id: validated.projectId, ownerId: session.user.id },
  });
  if (!project) throw new Error("Project not found");

  const task = await prisma.task.create({
    data: {
      ...validated,
      userId: session.user.id,
    },
  });
  
  return task;
}
```

---

## Phase 5: UI Components

### 5.1 Create `src/app/tasks/new/page.tsx`
- Dedicated page with TaskCreateForm component
- Form uses react-hook-form + zodResolver with shadcn/ui **Field** components (Base UI)
- Uses Controller pattern for custom inputs (priority buttons, select, calendar)

### 5.2 Create `src/components/Task/TaskCreateForm.tsx`
Form structure using shadcn/ui Field (Controller pattern):
- Title input: `<Controller>` with Input + FieldLabel + FieldError
- Description textarea: `<Controller>` with Textarea
- Priority selector: `<Controller>` with Button icons (lucide `Flag`/`AlertCircle`) cycling High/Medium/Low
- Project selector: `<Controller>` with Select component (populated from user's projects)
- Due date picker: `<Controller>` with Calendar popover (shadcn calendar + date-fns)
- Submit button: disabled while `isSubmitting`, with icon toggle

---

## Phase 6: Navigation & Routing

### 6.1 Add route link
- Add "New Task" button to header or navigation
- Route to `/tasks/new`

### 6.2 After creation
- Redirect to `/tasks` (task list view)
- Show success toast via react-toastify

---

## Phase 7: Validation Checklist

- [ ] Run `bun lint` - passes ESLint
- [ ] Run `bun run build` - passes TypeScript compilation
- [ ] Test form validation (client + server)
- [ ] Test project ownership check
- [ ] Test redirect after creation
- [ ] Test error states (invalid project, validation errors)