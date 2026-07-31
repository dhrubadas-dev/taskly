import TaskList from "@/components/Task/TaskList";
import { getTasks } from "@/server/tasks";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks - Taskly",
  description: "View and manage your tasks",
};

type TasksPageProps = {
  searchParams: Promise<{
    page?: string;
    sort?: string;
    order?: string;
  }>;
};

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const sort =
    (params.sort as "dueDate" | "priority" | "createdAt") || "dueDate";
  const order = (params.order as "asc" | "desc") || "asc";

  const initialData = await getTasks({ page, sort, sortOrder: order });

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="mb-6 text-2xl font-bold">Tasks</h1>
      <TaskList initialData={initialData} />
    </div>
  );
}
