"use client";

import { FolderPen, FolderPlus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "react-toastify";

import { Button } from "@/components/shadcnui/button";
import { deleteProject, getProjects } from "@/server/projects";

type Project = Awaited<ReturnType<typeof getProjects>>[number];

type ProjectListProps = {
  projects: Project[];
};

export default function ProjectList({ projects }: ProjectListProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete project "${name}" and all its tasks?`)) return;
    try {
      await deleteProject(id);
      toast.success("Project deleted");
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete project",
      );
    }
  };

  const handleEdit = (id: string) => {
    startTransition(() => router.push(`/projects/${id}/edit`));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {projects.length === 0 ?
            "No projects yet"
          : `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
        </p>

        <Button
          type="button"
          variant="default"
          onClick={() => startTransition(() => router.push("/projects/new"))}>
          <FolderPlus data-icon="inline-start" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ?
        <div className="text-muted-foreground flex flex-col items-center gap-2 rounded-xl border border-dashed py-12 text-center">
          <span className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-full">
            <FolderPlus className="size-7" />
          </span>
          <p className="text-lg font-medium">No projects yet</p>
          <p className="text-sm">
            Create your first project to organize tasks.
          </p>
        </div>
      : <div className="flex flex-col gap-2">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-card text-card-foreground hover:border-primary/30 flex items-center justify-between rounded-xl border px-4 py-3 transition-all hover:shadow-sm">
              <div className="flex items-center gap-3">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: project.color }}
                  aria-hidden="true"
                />
                <div>
                  <p className="font-medium">{project.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {project._count.tasks} tasks
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(project.id)}>
                  <FolderPen />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(project.id, project.name)}>
                  <Trash2 className="text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
}
