"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/database/dbClient";
import {
  createTaskSchema,
  subtaskSchema,
  updateTaskSchema,
  type CreateTaskFormData,
  type UpdateTaskFormData,
} from "@/lib/zodSchema";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function createTask(values: CreateTaskFormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const validated = createTaskSchema.parse(values);

  const project = await prisma.project.findFirst({
    where: { id: validated.projectId, ownerId: session.user.id },
  });
  if (!project) throw new Error("Project not found");

  const task = await prisma.task.create({
    data: {
      title: validated.title,
      description: validated.description,
      priority: validated.priority ?? "MEDIUM",
      dueDate: validated.dueDate,
      userId: session.user.id,
      projectId: validated.projectId,
    },
  });

  revalidatePath("/tasks");
  return task;
}

type FilterPreset =
  "urgent" | "today" | "yesterday" | "upcoming" | "no-date" | "all";

export async function getTasks({
  page = 1,
  pageSize = 20,
  filter = "all",
  sort = "dueDate",
  sortOrder = "asc",
}: {
  page?: number;
  pageSize?: number;
  filter?: FilterPreset;
  sort?: "dueDate" | "priority" | "createdAt";
  sortOrder?: "asc" | "desc";
} = {}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const skip = (page - 1) * pageSize;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const where: Record<string, unknown> = { userId: session.user.id };

  switch (filter) {
    case "urgent":
      where.dueDate = { lte: tomorrow };
      break;
    case "today":
      where.dueDate = { gte: today, lt: tomorrow };
      break;
    case "yesterday":
      where.dueDate = { gte: yesterday, lt: today };
      break;
    case "upcoming":
      where.dueDate = { gt: tomorrow };
      break;
    case "no-date":
      where.dueDate = null;
      break;
    case "all":
    default:
      break;
  }

  const effectiveSort =
    filter !== "all" && filter !== "no-date" ? "dueDate" : sort;
  const effectiveOrder =
    filter !== "all" && filter !== "no-date" ? "asc" : sortOrder;

  const orderByMap: Record<string, "asc" | "desc"> = {
    dueDate: effectiveOrder,
    priority: effectiveOrder,
    createdAt: effectiveOrder,
  };

  const orderByField =
    effectiveSort === "createdAt" ? "createdAt" : effectiveSort;

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, color: true } },
        subtasks: { select: { id: true, title: true, completed: true } },
      },
      orderBy:
        effectiveSort === "priority" ?
          [{ priority: effectiveOrder }, { dueDate: "asc" }]
        : [{ [orderByField]: orderByMap[orderByField] }, { createdAt: "desc" }],
      skip,
      take: pageSize,
    }),
    prisma.task.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return { tasks, total, page, totalPages };
}

export async function getTaskById(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const task = await prisma.task.findFirst({
    where: { id, userId: session.user.id },
    include: {
      project: { select: { id: true, name: true, color: true } },
      subtasks: { select: { id: true, title: true, completed: true } },
    },
  });

  if (!task) throw new Error("Task not found");
  return task;
}

export async function toggleTaskCompletion(id: string, completed: boolean) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const task = await prisma.task.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!task) throw new Error("Task not found");

  await prisma.task.update({
    where: { id },
    data: { completed },
  });

  revalidatePath("/tasks");
  return { id, completed };
}

export async function updateTask(id: string, values: UpdateTaskFormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const validated = updateTaskSchema.parse(values);

  const existing = await prisma.task.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) throw new Error("Task not found");

  if (validated.projectId && validated.projectId !== existing.projectId) {
    const project = await prisma.project.findFirst({
      where: { id: validated.projectId, ownerId: session.user.id },
    });
    if (!project) throw new Error("Project not found");
  }

  const task = await prisma.task.update({
    where: { id },
    data: validated,
  });

  revalidatePath("/tasks");
  revalidatePath(`/tasks/${id}`);
  return task;
}

export async function createSubtask(taskId: string, title: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const validated = subtaskSchema.parse({ title });

  const task = await prisma.task.findFirst({
    where: { id: taskId, userId: session.user.id },
  });
  if (!task) throw new Error("Task not found");

  const subtask = await prisma.subtask.create({
    data: {
      title: validated.title,
      taskId,
    },
  });

  revalidatePath(`/tasks/${taskId}`);
  return subtask;
}

export async function toggleSubtask(id: string, completed: boolean) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const subtask = await prisma.subtask.findFirst({
    where: { id, task: { userId: session.user.id } },
  });
  if (!subtask) throw new Error("Subtask not found");

  await prisma.subtask.update({
    where: { id },
    data: { completed },
  });

  revalidatePath(`/tasks/${subtask.taskId}`);
  return { id, completed };
}

export async function renameSubtask(id: string, title: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const validated = subtaskSchema.parse({ title });

  const subtask = await prisma.subtask.findFirst({
    where: { id, task: { userId: session.user.id } },
  });
  if (!subtask) throw new Error("Subtask not found");

  const updated = await prisma.subtask.update({
    where: { id },
    data: { title: validated.title },
  });

  revalidatePath(`/tasks/${subtask.taskId}`);
  return updated;
}

export async function deleteSubtask(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const subtask = await prisma.subtask.findFirst({
    where: { id, task: { userId: session.user.id } },
  });
  if (!subtask) throw new Error("Subtask not found");

  await prisma.subtask.delete({ where: { id } });

  revalidatePath(`/tasks/${subtask.taskId}`);
  return { id };
}

export async function deleteTask(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const task = await prisma.task.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!task) throw new Error("Task not found");

  await prisma.task.delete({ where: { id } });

  revalidatePath("/tasks");
  return { id };
}
