"use client";

import { Button } from "@/components/shadcnui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcnui/select";
import { getTasks, toggleTaskCompletion } from "@/server/tasks";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import TaskListItem from "./TaskListItem";

type SortField = "dueDate" | "priority" | "createdAt";
type SortOrder = "asc" | "desc";

const sortOptions: { value: string; label: string }[] = [
  { value: "dueDate-asc", label: "Due Date ↑" },
  { value: "dueDate-desc", label: "Due Date ↓" },
  { value: "priority-asc", label: "Priority ↑" },
  { value: "priority-desc", label: "Priority ↓" },
  { value: "createdAt-asc", label: "Created ↑" },
  { value: "createdAt-desc", label: "Created ↓" },
];

type TaskListProps = {
  initialData: Awaited<ReturnType<typeof getTasks>>;
};

const TaskList = ({ initialData }: TaskListProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "dueDate";
  const currentOrder = (searchParams.get("order") as SortOrder) || "asc";

  const [, startTransition] = useTransition();

  const createQueryString = useCallback(
    (params: Record<string, string>) => {
      const newParams = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(params)) {
        newParams.set(key, value);
      }
      return newParams.toString();
    },
    [searchParams],
  );

  const handlePageChange = (page: number) => {
    startTransition(() => {
      router.push(`/tasks?${createQueryString({ page: String(page) })}`);
    });
  };

  const handleSortChange = (value: string | null) => {
    if (!value) return;
    const [sort, order] = value.split("-") as [SortField, SortOrder];
    startTransition(() => {
      router.push(`/tasks?${createQueryString({ sort, order, page: "1" })}`);
    });
  };

  const handleToggle = async (id: string, completed: boolean) => {
    await toggleTaskCompletion(id, completed);
    router.refresh();
  };

  const { tasks, total, page, totalPages } = initialData;
  const sortValue = `${currentSort}-${currentOrder}`;

  return (
    <div className="space-y-4">
      {/* Sort controls */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {total === 0 ? "No tasks" : `${total} task${total !== 1 ? "s" : ""}`}
        </p>

        <div className="flex items-center gap-2">
          <Select
            value={sortValue}
            onValueChange={handleSortChange}>
            <SelectTrigger className="w-44">
              <ArrowUpDown className="h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task list */}
      {tasks.length === 0 ?
        <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center">
          <ListOrdered className="h-12 w-12 opacity-30" />
          <p className="text-lg font-medium">No tasks yet</p>
          <p className="text-sm">Create your first task to get started.</p>
        </div>
      : <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TaskListItem
              key={task.id}
              task={task}
              onToggle={handleToggle}
            />
          ))}
        </div>
      }

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-muted-foreground text-sm">
            Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of{" "}
            {total}
          </p>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
