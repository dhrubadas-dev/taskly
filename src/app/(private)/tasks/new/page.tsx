import TaskCreateForm from "@/components/Task/TaskCreateForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Task - Taskly",
  description: "Create a new task",
};

const NewTaskPage = () => {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="mb-6 text-2xl font-bold">Create New Task</h1>
      <TaskCreateForm />
    </div>
  );
};

export default NewTaskPage;
