"use client";

import { Button } from "@/components/shadcnui/button";
import { Input } from "@/components/shadcnui/input";
import {
  createSubtask,
  deleteSubtask,
  renameSubtask,
  toggleSubtask,
} from "@/server/tasks";
import { CircleCheck, CircleDot, Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "react-toastify";

type Subtask = {
  id: string;
  title: string;
  completed: boolean;
};

type SubtaskListProps = {
  taskId: string;
  initialSubtasks: Subtask[];
};

const SubtaskList = ({ taskId, initialSubtasks }: SubtaskListProps) => {
  const router = useRouter();
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialSubtasks);
  const [newTitle, setNewTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const addInputRef = useRef<HTMLInputElement>(null);

  const completedCount = subtasks.filter((s) => s.completed).length;

  const handleAdd = async () => {
    const title = newTitle.trim();
    if (!title) return;

    setIsAdding(true);
    try {
      const subtask = await createSubtask(taskId, title);
      setSubtasks((prev) => [
        ...prev,
        { id: subtask.id, title: subtask.title, completed: subtask.completed },
      ]);
      setNewTitle("");
      addInputRef.current?.focus();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add subtask",
      );
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggle = async (id: string, completed: boolean) => {
    // Optimistic update
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed } : s)),
    );
    try {
      await toggleSubtask(id, completed);
    } catch (error) {
      // Revert on failure
      setSubtasks((prev) =>
        prev.map((s) => (s.id === id ? { ...s, completed: !completed } : s)),
      );
      toast.error(
        error instanceof Error ? error.message : "Failed to update subtask",
      );
    }
  };

  const startRename = (subtask: Subtask) => {
    setEditingId(subtask.id);
    setEditingTitle(subtask.title);
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const saveRename = async (id: string) => {
    const title = editingTitle.trim();
    if (!title) {
      cancelRename();
      return;
    }

    const original = subtasks.find((s) => s.id === id)?.title ?? "";
    if (title === original) {
      cancelRename();
      return;
    }

    // Optimistic update
    setSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, title } : s)));
    setEditingId(null);
    setEditingTitle("");

    try {
      await renameSubtask(id, title);
    } catch (error) {
      // Revert on failure
      setSubtasks((prev) =>
        prev.map((s) => (s.id === id ? { ...s, title: original } : s)),
      );
      toast.error(
        error instanceof Error ? error.message : "Failed to rename subtask",
      );
    }
  };

  const handleDelete = async (id: string) => {
    const original = subtasks;
    // Optimistic removal
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteSubtask(id);
    } catch (error) {
      // Revert on failure
      setSubtasks(original);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete subtask",
      );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          Subtasks
        </p>
        <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
          {completedCount}/{subtasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className="group flex items-center gap-2 rounded-lg border px-3 py-2">
            <button
              type="button"
              onClick={() => handleToggle(subtask.id, !subtask.completed)}
              aria-label={
                subtask.completed ?
                  `Mark "${subtask.title}" as incomplete`
                : `Mark "${subtask.title}" as complete`
              }
              className="shrink-0 cursor-pointer">
              {subtask.completed ?
                <CircleCheck className="h-4 w-4 text-green-500" />
              : <CircleDot className="text-muted-foreground hover:text-foreground h-4 w-4 transition-colors" />
              }
            </button>

            {editingId === subtask.id ?
              <Input
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void saveRename(subtask.id);
                  }
                  if (e.key === "Escape") {
                    cancelRename();
                  }
                }}
                onBlur={() => void saveRename(subtask.id)}
                autoFocus
                autoComplete="off"
                className="h-7"
                aria-label="Edit subtask title"
              />
            : <span
                className={`flex-1 text-sm ${
                  subtask.completed ? "text-muted-foreground line-through" : ""
                }`}>
                {subtask.title}
              </span>
            }

            {editingId !== subtask.id && (
              <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground size-7"
                  onClick={() => startRename(subtask)}
                  aria-label={`Rename "${subtask.title}"`}>
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive size-7"
                  onClick={() => handleDelete(subtask.id)}
                  aria-label={`Delete "${subtask.title}"`}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add new subtask */}
      <div className="flex items-center gap-2">
        <Input
          ref={addInputRef}
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void handleAdd();
            }
            if (e.key === "Escape" && newTitle) {
              setNewTitle("");
            }
          }}
          placeholder="Add a subtask..."
          autoComplete="off"
          disabled={isAdding}
          maxLength={255}
          aria-label="New subtask title"
        />
        {newTitle.trim() ?
          <>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => void handleAdd()}
              disabled={isAdding}
              aria-label="Add subtask">
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setNewTitle("")}
              disabled={isAdding}
              aria-label="Clear input">
              <X className="h-4 w-4" />
            </Button>
          </>
        : null}
      </div>
    </div>
  );
};

export default SubtaskList;
