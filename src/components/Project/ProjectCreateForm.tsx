"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { Button } from "@/components/shadcnui/button";
import { Field, FieldError, FieldLabel } from "@/components/shadcnui/field";
import { Input } from "@/components/shadcnui/input";
import {
  createProjectSchema,
  type CreateProjectFormData,
} from "@/lib/zodSchema";
import { createProject } from "@/server/projects";

const colorOptions = [
  { value: "#6366f1", label: "Indigo" },
  { value: "#ef4444", label: "Red" },
  { value: "#f97316", label: "Orange" },
  { value: "#eab308", label: "Yellow" },
  { value: "#22c55e", label: "Green" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#a855f7", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#78716c", label: "Stone" },
];

export default function ProjectCreateForm() {
  const router = useRouter();

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      color: "#6366f1",
    },
    mode: "all",
  });

  const onSubmit = async (values: CreateProjectFormData) => {
    try {
      await createProject(values);
      toast.success("Project created successfully");
      router.push("/projects");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create project",
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-6">
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Project Name</FieldLabel>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              autoComplete="off"
              disabled={isSubmitting}
              placeholder="My Project"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="color"
        control={control}
        render={({ field }) => (
          <Field>
            <FieldLabel>Color</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => field.onChange(option.value)}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    field.value === option.value ?
                      "border-foreground scale-110"
                    : "border-transparent hover:scale-110"
                  }`}
                  style={{ backgroundColor: option.value }}
                  aria-label={option.label}
                  title={option.label}
                />
              ))}
            </div>
          </Field>
        )}
      />

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Project"}
        </Button>
      </div>
    </form>
  );
}
