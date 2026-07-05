"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Flag, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "react-toastify";

import { createTaskSchema, type CreateTaskFormData } from "@/lib/zodSchema";
import { Button } from "@/components/shadcnui/button";
import { Input } from "@/components/shadcnui/input";
import { Textarea } from "@/components/shadcnui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/shadcnui/select";
import { Calendar } from "@/components/shadcnui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/shadcnui/popover";
import { Field, FieldLabel, FieldError } from "@/components/shadcnui/field";
import { createTask } from "@/server/tasks";

const priorityOptions = [
  { value: "HIGH", label: "High", icon: Flag, color: "text-red-500" },
  { value: "MEDIUM", label: "Medium", icon: Flag, color: "text-yellow-500" },
  { value: "LOW", label: "Low", icon: Flag, color: "text-green-500" },
] as const;

export default function TaskCreateForm() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

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
      toast.error(error instanceof Error ? error.message : "Failed to create task");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
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
          const currentIndex = priorityOptions.findIndex((p) => p.value === currentValue);
          const nextPriority = priorityOptions[(currentIndex + 1) % priorityOptions.length];

          return (
            <Field>
              <FieldLabel>Priority</FieldLabel>
              <Button
                type="button"
                variant="outline"
                onClick={() => field.onChange(nextPriority.value)}
                disabled={isSubmitting}
              >
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
              disabled={isSubmitting}
            >
              <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="project-1">Project 1</SelectItem>
                <SelectItem value="project-2">Project 2</SelectItem>
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
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? format(new Date(field.value), "PPP") : "Pick a date"}
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

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Task"}
      </Button>
    </form>
  );
}