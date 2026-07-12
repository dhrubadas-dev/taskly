# Task List View — Implementation Plan

## Overview

Replace the placeholder `/tasks` page with a fully functional, paginated task list showing **all tasks across all projects**, with project name tags. Clicking a task navigates to a read-only detail page. No smart list tabs.

---

## Defaults

- **Sort:** Due Date ascending (soonest first)
- **Page size:** 20 tasks per page
- **Scope:** All tasks across all projects (with project color tags)
- **Smart list tabs:** Not included
- **Detail page:** Read-only (edit deferred to later)
- **Delete confirmation:** Modal/dialog

---

## Files to Modify

### 1. `src/lib/zodSchema.ts`

- Add `updateTaskSchema` for future edit use.

### 2. `src/app/(private)/tasks/page.tsx`

- Replace the placeholder `<p>Task list will be implemented here.</p>` with `<TaskList />`.

---

## Files to Create

### 3. `src/server/tasks.ts` — Extend with new server actions

| Action                                          | Description                                                                                                           |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `getTasks(page?, pageSize?, sort?, sortOrder?)` | Paginated query with `LIMIT/OFFSET`. Default sort: `dueDate` ascending. Returns `{ tasks, total, page, totalPages }`. |
| `getTaskById(id)`                               | Single task with included `project` and `subtasks`.                                                                   |
| `toggleTaskCompletion(id, completed)`           | Toggle task completion state (optimistic update on client).                                                           |
| `deleteTask(id)`                                | Delete a task by ID.                                                                                                  |

### 4. `src/components/Task/TaskList.tsx`

- Client component (`"use client"`)
- Fetches paginated tasks via `getTasks` server action
- Sort dropdown: **Due Date** | **Priority** | **Created** (default: Due Date ascending)
- Renders `<TaskListItem />` for each task
- Pagination bar: "Showing 1-20 of X" + Prev / Next buttons
- Page stored in URL query param: `/tasks?page=2`

### 5. `src/components/Task/TaskListItem.tsx`

- Checkbox → optimistic toggle via `toggleTaskCompletion`
- Title → clickable link to `/tasks/[id]`
- Priority badge: High (red), Medium (yellow), Low (green)
- Due date: red text if overdue and not completed
- Project tag: colored pill matching project color
- Completed items: strikethrough + muted styling

### 6. `src/app/(private)/tasks/[id]/page.tsx`

- Server component, calls `getTaskById(id)`
- Renders `<TaskDetail />` client component

### 7. `src/components/Task/TaskDetail.tsx`

- Read-only view: title, description, priority, due date, project name, subtasks list
- Delete button → confirmation dialog → `deleteTask` → redirect to `/tasks`
- Back button → `/tasks`

---

## Visual Layout

### Task List

```
Sort: [Due Date ▼]  [↑]

[☐]  Buy groceries from the store        ● High   Jun 12   [Personal]
[✓]  Finish quarterly report             ● Low    Jun 10   [Work]
[☐]  Set up CI/CD pipeline               ● Med    Jun 15   [Work]

Showing 1-20 of 47  [< Prev]  [Next >]
```

### Task Detail (read-only)

```
← Back to Tasks

# Buy groceries from the store

**Priority:** ● High
**Due Date:** Jun 12, 2026
**Project:** [Personal]

## Description
Milk, eggs, bread, and vegetables.

## Subtasks
[✓] Check fridge for what's needed
[☐] Make a list
[☐] Go to store

[Delete Task]
```
