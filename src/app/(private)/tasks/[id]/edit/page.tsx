import TaskEditForm from "@/components/Task/TaskEditForm";
import { getTaskById } from "@/server/tasks";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type EditTaskPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Edit Task - Taskly",
  description: "Edit task details",
};

const EditTaskPage = async ({ params }: EditTaskPageProps) => {
  const { id } = await params;

  let task;
  try {
    task = await getTaskById(id);
  } catch {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="mb-6 text-2xl font-bold">Edit Task</h1>
      <TaskEditForm task={task} />
    </div>
  );
};

export default EditTaskPage;
