"use client";

import { Icon } from "@iconify/react";
import { Spinner } from "flowbite-react";
import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export function AuthHeading({ title, text, eyebrow }: { title: string; text?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <div className="mb-8">
      {eyebrow}
      <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ld">{title}</h1>
      {text && <p className="mt-2 text-[15px] leading-relaxed text-darklink">{text}</p>}
    </div>
  );
}

// First sign-in only: new password, second step, backup codes.
const SETUP_STEPS = ["Password", "Second step", "Backup codes"];

export function SetupProgress({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="mb-6">
      <div className="flex gap-1.5">
        {SETUP_STEPS.map((s, i) => (
          <span key={s} className={twMerge("h-1 flex-1 rounded-full bg-border dark:bg-darkborder", i < step && "bg-primary dark:bg-primary")} />
        ))}
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-darklink">
        Account set-up · {step} of 3 · {SETUP_STEPS[step - 1]}
      </p>
    </div>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode;
  icon?: string;
  hint?: ReactNode;
  error?: string;
  trailing?: ReactNode;
};

export const AuthField = forwardRef<HTMLInputElement, FieldProps>(function AuthField(
  { label, icon, hint, error, trailing, id, className, ...input },
  ref,
) {
  return (
    <div className="mb-5">
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-ld">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <Icon icon={icon} width={19} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-darklink" />
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={!!error || undefined}
          className={twMerge(
            "h-12 w-full rounded-xl border border-border bg-white px-4 text-[15px] text-ld shadow-none outline-none transition",
            "placeholder:text-darklink/70 focus:border-primary focus:ring-4 focus:ring-primary/15",
            "dark:border-darkborder dark:bg-darkgray dark:focus:border-primary",
            icon && "pl-11",
            trailing && "pr-12",
            error && "border-error focus:border-error focus:ring-error/15 dark:border-error",
            className,
          )}
          {...input}
        />
        {trailing && <div className="absolute inset-y-0 right-0 flex items-center pr-2">{trailing}</div>}
      </div>
      {error ? (
        <p className="mt-1.5 text-sm text-error">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs leading-relaxed text-darklink">{hint}</p>
      )}
    </div>
  );
});

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  busy?: boolean;
  icon?: string;
};

export function AuthButton({ variant = "primary", busy, icon, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || busy}
      className={twMerge(
        "inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-[15px] font-semibold transition",
        "focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-55",
        variant === "primary"
          ? "bg-primary text-white hover:bg-primaryemphasis focus-visible:ring-primary/25"
          : "border border-border bg-white text-ld hover:bg-lighthover focus-visible:ring-primary/15 dark:border-darkborder dark:bg-darkgray dark:hover:bg-darkmuted",
        className,
      )}
      {...props}
    >
      {busy ? <Spinner size="sm" light={variant === "primary"} /> : icon && <Icon icon={icon} width={20} />}
      {children}
    </button>
  );
}

export function TextAction({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={twMerge("text-sm font-medium text-darklink transition hover:text-primary disabled:opacity-50", className)}
      {...props}
    />
  );
}

export function OrDivider({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.12em] text-darklink">
      <span className="h-px flex-1 bg-border dark:bg-darkborder" />
      {children}
      <span className="h-px flex-1 bg-border dark:bg-darkborder" />
    </div>
  );
}
