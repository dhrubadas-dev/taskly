import ProjectCreateForm from "@/components/Project/ProjectCreateForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Project - Taskly",
  description: "Create a new project",
};

export default function NewProjectPage() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="mb-6 text-2xl font-bold">Create New Project</h1>
      <ProjectCreateForm />
    </div>
  );
}
