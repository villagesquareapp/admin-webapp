"use client";

import { Button as FlowbiteButton } from "flowbite-react";
import Link from "next/link";
import { forwardRef, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import customTheme from "@/utils/theme/custom-theme";

// flowbite-react 0.10's Button, on 0.12: colour, radius and className stay on the
// button, and the size padding sits on an inner span, so a className such as
// "py-3 px-2" or "lg:text-base" styles the same element it always did.
const innerSize: Record<string, string> = {
  xs: "px-2 py-1 text-xs",
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
  xl: "px-6 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, any>(function Button(
  { children, className, size = "md", pill, ...props },
  ref,
) {
  return (
    <FlowbiteButton ref={ref} size={size} pill={pill} className={twMerge(pill ? undefined : "rounded-lg", className)} {...props}>
      <span className={twMerge(customTheme.button.inner.base, pill ? "rounded-full" : "rounded-md", innerSize[size])}>
        {children}
      </span>
    </FlowbiteButton>
  );
}) as unknown as typeof FlowbiteButton;

// A Button rendered as next/link, for server components: they can't pass Link
// itself to a client component.
export function LinkButton(props: { href: string; color?: string; className?: string; children?: ReactNode }) {
  return <Button as={Link} {...props} />;
}
