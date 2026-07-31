import TaskDetail from "@/components/Task/TaskDetail";
import { getTaskById } from "@/server/tasks";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type TaskDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: TaskDetailPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const task = await getTaskById(id);
    return {
      title: `${task.title} - Taskly`,
      description: task.description ?? "Task details",
    };
  } catch {
    return { title: "Task Not Found - Taskly" };
  }
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = await params;

  try {
    const task = await getTaskById(id);
    return (
      <div className="container mx-auto max-w-2xl py-8">
        <TaskDetail task={task} />
      </div>
    );
  } catch {
    notFound();
  }
}
