import PageHeader from "@/components/PageHeader/PageHeader";
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
      <PageHeader
        title="Projects"
        description="Organize your tasks into projects"
      />
      <ProjectList projects={projects} />
    </div>
  );
}
