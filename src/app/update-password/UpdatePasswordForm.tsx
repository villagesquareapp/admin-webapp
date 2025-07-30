"use client";

import {
  updatePasswordSchema,
  type UpdatePasswordFormValues,
} from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button, Label, TextInput } from "flowbite-react";
import React from "react";
import { HiEye, HiEyeOff } from "react-icons/hi";

const UpdatePasswordForm = () => {
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const form = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: UpdatePasswordFormValues) => {
    setIsSubmitting(true);
    try {
      // 🔐 Replace with your update password API call
      console.log("Updating password with:", data);

      toast.success("Password updated successfully");
      form.reset();
    } catch (error) {
      toast.error("Failed to update password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="mt-6">
      <center className="mb-4">
        <p className="text-2xl font-bold">Update Password</p>
      </center>
      <div className="mb-4">
        <div className="mb-2 block">
          <Label htmlFor="currentPassword" value="Current Password" />
        </div>
        <div className="relative">
          <TextInput
            id="password"
            type={showPassword ? "text" : "password"}
            sizing="md"
            className={`form-control`}
            {...form.register("currentPassword")}
            color={form.formState.errors.currentPassword ? "failure" : ""}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <HiEyeOff className="h-5 w-5 text-gray-500" />
            ) : (
              <HiEye className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
        {form.formState.errors.currentPassword && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.currentPassword.message}
          </p>
        )}
      </div>
      <div className="mb-4">
        <div className="mb-2 block">
          <Label htmlFor="newPassword" value="New Password" />
        </div>
        <div className="relative">
          <TextInput
            id="password"
            type={showPassword ? "text" : "password"}
            sizing="md"
            className={`form-control`}
            {...form.register("newPassword")}
            color={form.formState.errors.newPassword ? "failure" : ""}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <HiEyeOff className="h-5 w-5 text-gray-500" />
            ) : (
              <HiEye className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
        {form.formState.errors.newPassword && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.newPassword.message}</p>
        )}
      </div>
      <div className="mb-4">
        <div className="mb-2 block">
          <Label htmlFor="confirmPassword" value="Confirm Password" />
        </div>
        <div className="relative">
          <TextInput
            id="password"
            type={showPassword ? "text" : "password"}
            sizing="md"
            className={`form-control`}
            {...form.register("confirmPassword")}
            color={form.formState.errors.confirmPassword ? "failure" : ""}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <HiEyeOff className="h-5 w-5 text-gray-500" />
            ) : (
              <HiEye className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
        {form.formState.errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.confirmPassword.message}</p>
        )}
      </div>
      <Button type="submit" color="primary" className="w-full">
        Update Password
      </Button>
    </form>
  );
};

export default UpdatePasswordForm;
