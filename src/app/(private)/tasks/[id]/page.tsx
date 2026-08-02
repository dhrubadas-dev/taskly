import TaskDetail from "@/components/Task/TaskDetail";
import { getTaskById } from "@/server/tasks";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type TaskDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const generateMetadata = async ({
  params,
}: TaskDetailPageProps): Promise<Metadata> => {
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
};

const TaskDetailPage = async ({ params }: TaskDetailPageProps) => {
  const { id } = await params;

  const task = await getTaskById(id).catch(() => null);

  if (!task) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <TaskDetail task={task} />
    </div>
  );
};

export default TaskDetailPage;
