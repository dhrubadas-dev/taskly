"use client";

import { Checkbox } from "@/components/shadcnui/checkbox";
import { cn } from "@/lib/utils";
import { type Priority } from "@generated/prisma/client";
import { format, isPast, isToday } from "date-fns";
import { Flag } from "lucide-react";
import Link from "next/link";
import { useOptimistic, useTransition } from "react";

type TaskWithRelations = {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  dueDate: Date | null;
  completed: boolean;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  project: { id: string; name: string; color: string };
  subtasks: { id: string; title: string; completed: boolean }[];
};

type TaskListItemProps = {
  task: TaskWithRelations;
  onToggle: (id: string, completed: boolean) => Promise<void>;
};

const priorityConfig = {
  HIGH: { label: "High", color: "text-red-500", bg: "bg-red-500/10" },
  MEDIUM: { label: "Medium", color: "text-yellow-500", bg: "bg-yellow-500/10" },
  LOW: { label: "Low", color: "text-green-500", bg: "bg-green-500/10" },
} as const;

export default function TaskListItem({ task, onToggle }: TaskListItemProps) {
  const [, startTransition] = useTransition();
  const [optimisticCompleted, setOptimisticCompleted] = useOptimistic(
    task.completed,
  );

  const isOverdue =
    !optimisticCompleted &&
    task.dueDate &&
    isPast(task.dueDate) &&
    !isToday(task.dueDate);

  const handleToggle = () => {
    const newCompleted = !optimisticCompleted;
    startTransition(async () => {
      setOptimisticCompleted(newCompleted);
      await onToggle(task.id, newCompleted);
    });
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border px-4 py-3 transition-all",
        optimisticCompleted && "bg-muted/30",
        !optimisticCompleted &&
          "bg-card hover:border-primary/30 hover:shadow-sm",
      )}>
      <Checkbox
        checked={optimisticCompleted}
        onCheckedChange={handleToggle}
        aria-label={
          optimisticCompleted ? "Mark as incomplete" : "Mark as complete"
        }
      />

      <Link
        href={`/tasks/${task.id}`}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-3",
          optimisticCompleted && "opacity-60",
        )}>
        <span
          className={cn(
            "flex-1 truncate text-sm font-medium",
            optimisticCompleted && "text-muted-foreground line-through",
          )}>
          {task.title}
        </span>

        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            priorityConfig[task.priority].bg,
            priorityConfig[task.priority].color,
          )}>
          <Flag className="h-3 w-3" />
          {priorityConfig[task.priority].label}
        </span>

        {task.dueDate && (
          <span
            className={cn(
              "text-xs whitespace-nowrap",
              isOverdue ? "font-medium text-red-500" : "text-muted-foreground",
              optimisticCompleted && "text-muted-foreground",
            )}>
            {format(new Date(task.dueDate), "MMM d")}
          </span>
        )}

        {task.subtasks.length > 0 && (
          <span className="text-muted-foreground hidden text-xs whitespace-nowrap sm:inline">
            {task.subtasks.filter((s) => s.completed).length}/
            {task.subtasks.length}
          </span>
        )}

        <span
          className="hidden items-center rounded-full px-2 py-0.5 text-xs font-medium sm:inline-flex"
          style={{
            backgroundColor: `${task.project.color}20`,
            color: task.project.color,
          }}>
          {task.project.name}
        </span>
      </Link>
    </div>
  );
}
