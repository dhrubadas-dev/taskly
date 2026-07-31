import ProjectList from "@/components/Project/ProjectList";
import { getProjects } from "@/server/projects";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects - Taskly",
  description: "Manage your projects",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="mb-6 text-2xl font-bold">Projects</h1>
      <ProjectList projects={projects} />
    </div>
  );
}
