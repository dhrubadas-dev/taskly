"use client";

import { Button } from "@/components/shadcnui/button";
import { cn } from "@/lib/utils";
import { deleteTask, getTaskById } from "@/server/tasks";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  CircleCheck,
  CircleDot,
  Flag,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

type TaskWithRelations = Awaited<ReturnType<typeof getTaskById>>;

const priorityConfig = {
  HIGH: { label: "High", color: "text-red-500", bg: "bg-red-500/10" },
  MEDIUM: { label: "Medium", color: "text-yellow-500", bg: "bg-yellow-500/10" },
  LOW: { label: "Low", color: "text-green-500", bg: "bg-green-500/10" },
} as const;

type TaskDetailProps = {
  task: TaskWithRelations;
};

export default function TaskDetail({ task }: TaskDetailProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTask(task.id);
      toast.success("Task deleted successfully");
      router.push("/tasks");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete task",
      );
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/tasks"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Tasks
      </Link>

      {/* Title and actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1
            className={`text-2xl font-semibold ${
              task.completed ? "text-muted-foreground line-through" : ""
            }`}>
            {task.title}
          </h1>
          {task.completed && (
            <p className="text-muted-foreground flex items-center gap-1 text-sm">
              <CircleCheck className="h-4 w-4 text-green-500" />
              Completed
            </p>
          )}
        </div>

        {!showConfirm ?
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setShowConfirm(true)}
            disabled={isDeleting}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        : <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}>
              Cancel
            </Button>
          </div>
        }
      </div>

      {/* Details */}
      <div className="flex flex-wrap gap-6">
        {/* Priority */}
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Priority
          </p>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium",
              priorityConfig[task.priority].bg,
              priorityConfig[task.priority].color,
            )}>
            <Flag className="h-4 w-4" />
            {priorityConfig[task.priority].label}
          </span>
        </div>

        {/* Due date */}
        {task.dueDate && (
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Due Date
            </p>
            <p className="text-muted-foreground flex items-center gap-1 text-sm">
              <Calendar className="h-4 w-4" />
              {format(new Date(task.dueDate), "PPP")}
            </p>
          </div>
        )}

        {/* Project */}
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Project
          </p>
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
            style={{
              backgroundColor: `${task.project.color}20`,
              color: task.project.color,
            }}>
            {task.project.name}
          </span>
        </div>

        {/* Created */}
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Created
          </p>
          <p className="text-muted-foreground text-sm">
            {format(new Date(task.createdAt), "PPP")}
          </p>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Description
          </p>
          <p className="text-sm whitespace-pre-wrap">{task.description}</p>
        </div>
      )}

      {/* Subtasks */}
      {totalSubtasks > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Subtasks
            </p>
            <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
              {completedSubtasks}/{totalSubtasks}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {task.subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className="flex items-center gap-2 rounded-lg border px-3 py-2">
                {subtask.completed ?
                  <CircleCheck className="h-4 w-4 shrink-0 text-green-500" />
                : <CircleDot className="text-muted-foreground h-4 w-4 shrink-0" />
                }
                <span
                  className={`text-sm ${
                    subtask.completed ?
                      "text-muted-foreground line-through"
                    : ""
                  }`}>
                  {subtask.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
