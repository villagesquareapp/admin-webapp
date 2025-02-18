"use client";

import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Label, TextInput } from "flowbite-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { HiEye, HiEyeOff } from "react-icons/hi";

const AuthLogin = () => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = React.useState<boolean>(false);
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl: "/",
      });

      if (!result) {
        throw new Error("Authentication failed");
      }

      if (result?.error) {
        toast.error(result?.error);
      } else {
        setIsRedirecting(true);
        window.location.href = "/";
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      if (!isRedirecting) {
        setIsLoading(false);
      }
    }
  }

  return (
    <>
      <form className="mt-6" onSubmit={form.handleSubmit(onSubmit)}>
        <center className="mb-4">
          <p className="text-2xl font-bold">Admin Dashboard</p>
        </center>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="email" value="Username or Email" />
          </div>
          <TextInput
            id="email"
            type="text"
            sizing="md"
            {...form.register("email")}
            className={`form-control ${form.formState.errors.email ? "border-red-500" : ""}`}
          />
          {form.formState.errors.email && (
            <p className="mt-1 text-sm text-red-500">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="password" value="Password" />
          </div>
          <div className="relative">
            <TextInput
              id="password"
              type={showPassword ? "text" : "password"}
              sizing="md"
              {...form.register("password")}
              className={`form-control ${form.formState.errors.password ? "border-red-500" : ""
                }`}
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
          {form.formState.errors.password && (
            <p className="mt-1 text-sm text-red-500">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>
        {/* <div className="flex justify-between my-5">
          <div className="flex items-center gap-2">
            <Checkbox id="accept" className="checkbox" />
            <Label htmlFor="accept" className="opacity-90 font-normal cursor-pointer">
              Remeber this Device
            </Label>
          </div>
          <Link
            href={"/auth/auth1/forgot-password"}
            className="text-primary text-sm font-medium"
          >
            Forgot Password ?
          </Link>
        </div> */}
        <Button
          type="submit"
          color="primary"
          className="w-full"
          disabled={isLoading || isRedirecting}
        >
          {isLoading ? "Signing in..." : isRedirecting ? "Redirecting..." : "Sign in"}
        </Button>
      </form>
    </>
  );
};

export default AuthLogin;
