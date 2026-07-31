"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Flag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { Button } from "@/components/shadcnui/button";
import { Calendar } from "@/components/shadcnui/calendar";
import { Field, FieldError, FieldLabel } from "@/components/shadcnui/field";
import { Input } from "@/components/shadcnui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcnui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcnui/select";
import { Textarea } from "@/components/shadcnui/textarea";
import { createTaskSchema, type CreateTaskFormData } from "@/lib/zodSchema";
import { getProjects } from "@/server/projects";
import { createTask } from "@/server/tasks";

const priorityOptions = [
  { value: "HIGH", label: "High", icon: Flag, color: "text-red-500" },
  { value: "MEDIUM", label: "Medium", icon: Flag, color: "text-yellow-500" },
  { value: "LOW", label: "Low", icon: Flag, color: "text-green-500" },
] as const;

export default function TaskCreateForm() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [projects, setProjects] = useState<
    Awaited<ReturnType<typeof getProjects>>
  >([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch(() => toast.error("Failed to load projects"))
      .finally(() => setLoadingProjects(false));
  }, []);

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: undefined,
      dueDate: null,
      projectId: "",
    },
    mode: "all",
  });

  const onSubmit = async (values: CreateTaskFormData) => {
    try {
      const data = {
        ...values,
        priority: values.priority ?? "MEDIUM",
      };
      await createTask(data);
      toast.success("Task created successfully");
      router.push("/tasks");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create task",
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-6">
      <Controller
        name="title"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Title</FieldLabel>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              autoComplete="off"
              disabled={isSubmitting}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Description</FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              disabled={isSubmitting}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="priority"
        control={control}
        render={({ field }) => {
          const currentValue = field.value || "MEDIUM";
          const currentIndex = priorityOptions.findIndex(
            (p) => p.value === currentValue,
          );
          const nextPriority =
            priorityOptions[(currentIndex + 1) % priorityOptions.length];

          return (
            <Field>
              <FieldLabel>Priority</FieldLabel>
              <Button
                type="button"
                variant="outline"
                onClick={() => field.onChange(nextPriority.value)}
                disabled={isSubmitting}>
                <nextPriority.icon className={nextPriority.color} />
                {nextPriority.label}
              </Button>
            </Field>
          );
        }}
      />

      <Controller
        name="projectId"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Project</FieldLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isSubmitting || loadingProjects}>
              <SelectTrigger
                id={field.name}
                aria-invalid={fieldState.invalid}>
                <SelectValue
                  placeholder={
                    loadingProjects ? "Loading projects..." : "Select a project"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {projects.length === 0 ?
                  <SelectItem
                    value=""
                    disabled>
                    No projects available
                  </SelectItem>
                : projects.map((project) => (
                    <SelectItem
                      key={project.id}
                      value={project.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        {project.name}
                      </span>
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="dueDate"
        control={control}
        render={({ field }) => (
          <Field>
            <FieldLabel>Due Date</FieldLabel>
            <Popover>
              <PopoverTrigger>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left"
                  disabled={isSubmitting}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ?
                    format(new Date(field.value), "PPP")
                  : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) => {
                    field.onChange(date);
                    setSelectedDate(date);
                  }}
                />
              </PopoverContent>
            </Popover>
          </Field>
        )}
      />

      <Button
        type="submit"
        disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Task"}
      </Button>
    </form>
  );
}
