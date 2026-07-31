import ProjectEditForm from "@/components/Project/ProjectEditForm";
import { getProjectById } from "@/server/projects";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type EditProjectPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Edit Project - Taskly",
  description: "Edit project details",
};

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  const { id } = await params;

  let project;
  try {
    project = await getProjectById(id);
  } catch {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="mb-6 text-2xl font-bold">Edit Project</h1>
      <ProjectEditForm project={project} />
    </div>
  );
}
