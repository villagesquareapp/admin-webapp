import { z } from "zod";

export const loginSchema = z.object({
    email: z.email("Please enter a valid email address"),
    password: z.string().min(1, "Please enter your password"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(12, "Use at least 12 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;