"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/database/dbClient";
import {
  createProjectSchema,
  updateProjectSchema,
  type CreateProjectFormData,
  type UpdateProjectFormData,
} from "@/lib/zodSchema";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function getProjects() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const projects = await prisma.project.findMany({
    where: { ownerId: session.user.id },
    include: {
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return projects;
}

export async function getProjectById(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const project = await prisma.project.findFirst({
    where: { id, ownerId: session.user.id },
  });

  if (!project) throw new Error("Project not found");
  return project;
}

export async function createProject(values: CreateProjectFormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const validated = createProjectSchema.parse(values);

  const project = await prisma.project.create({
    data: {
      name: validated.name,
      color: validated.color,
      ownerId: session.user.id,
    },
  });

  revalidatePath("/projects");
  revalidatePath("/tasks/new");
  return project;
}

export async function updateProject(id: string, values: UpdateProjectFormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const validated = updateProjectSchema.parse(values);

  const existing = await prisma.project.findFirst({
    where: { id, ownerId: session.user.id },
  });
  if (!existing) throw new Error("Project not found");

  const project = await prisma.project.update({
    where: { id },
    data: validated,
  });

  revalidatePath("/projects");
  revalidatePath("/tasks");
  revalidatePath("/tasks/new");
  return project;
}

export async function deleteProject(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const project = await prisma.project.findFirst({
    where: { id, ownerId: session.user.id },
  });
  if (!project) throw new Error("Project not found");

  // Delete all tasks in the project first, then the project
  await prisma.task.deleteMany({ where: { projectId: id } });
  await prisma.project.delete({ where: { id } });

  revalidatePath("/projects");
  revalidatePath("/tasks");
  return { id };
}
