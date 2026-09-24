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
import { ChevronLeft, ChevronRight, Filter, ListOrdered } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import TaskListItem from "./TaskListItem";

type FilterPreset =
  "urgent" | "today" | "yesterday" | "upcoming" | "no-date" | "all";

const filterOptions: { value: FilterPreset; label: string }[] = [
  { value: "all", label: "All" },
  { value: "urgent", label: "Urgent" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "upcoming", label: "Upcoming" },
  { value: "no-date", label: "No Date" },
];

type TaskListProps = {
  initialData: Awaited<ReturnType<typeof getTasks>>;
};

const TaskList = ({ initialData }: TaskListProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentFilter = (searchParams.get("filter") as FilterPreset) || "all";
  const currentSort = searchParams.get("sort") || "dueDate";
  const currentOrder = (searchParams.get("order") as "asc" | "desc") || "asc";

  const [, startTransition] = useTransition();

  const createQueryString = useCallback(
    (params: Record<string, string>) => {
      const newParams = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(params)) {
        if (value === "") {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
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

  const handleFilterChange = (value: FilterPreset | null) => {
    if (!value) return;
    startTransition(() => {
      const params: Record<string, string> = { filter: value, page: "1" };
      if (value === "all") {
        params.sort = currentSort;
        params.order = currentOrder;
      } else {
        params.sort = "";
        params.order = "";
      }
      router.push(`/tasks?${createQueryString(params)}`);
    });
  };

  const handleToggle = async (id: string, completed: boolean) => {
    await toggleTaskCompletion(id, completed);
    router.refresh();
  };

  const { tasks, total, page, totalPages } = initialData;

  return (
    <div className="flex flex-col gap-4">
      {/* Filter controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm">
          {total === 0 ? "No tasks" : `${total} task${total !== 1 ? "s" : ""}`}
        </p>

        <div className="flex items-center gap-2">
          <Select
            value={currentFilter}
            onValueChange={handleFilterChange}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((option) => (
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
        <div className="text-muted-foreground flex flex-col items-center gap-2 rounded-xl border border-dashed py-12 text-center">
          <span className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-full">
            <ListOrdered className="size-7" />
          </span>
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
          <p className="text-muted-foreground hidden text-sm sm:block">
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
