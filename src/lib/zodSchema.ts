import { z } from "zod";

export const priorityEnum = z.enum(["HIGH", "MEDIUM", "LOW"]);

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(5000).optional(),
  priority: priorityEnum.optional(),
  dueDate: z.date().nullable().optional(),
  projectId: z.string().min(1, "Project is required"),
});

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255).optional(),
  description: z.string().max(5000).optional(),
  priority: priorityEnum.optional(),
  dueDate: z.date().nullable().optional(),
  completed: z.boolean().optional(),
  projectId: z.string().min(1, "Project is required").optional(),
});

export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color hex code"),
});

export type CreateProjectFormData = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Invalid color hex code")
    .optional(),
});

export type UpdateProjectFormData = z.infer<typeof updateProjectSchema>;
