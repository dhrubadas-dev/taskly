"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/database/dbClient";
import { createTaskSchema, type CreateTaskFormData } from "@/lib/zodSchema";

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

  return task;
}