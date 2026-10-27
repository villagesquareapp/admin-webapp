import { Icon } from "@iconify/react";
import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "../AuthShell";

export const metadata: Metadata = {
  title: "Sign-in problem · VillageSquare Admin",
  description: "The VillageSquare staff console couldn't sign you in",
};

// next-auth sends sign-in failures here as ?error=<code>.
const MESSAGES: Record<string, string> = {
  CredentialsSignin: "That sign-in didn't go through. Start again from your email and password.",
  SessionRequired: "Your session has ended. Sign in again to carry on.",
  AccessDenied: "This account can't use the staff console.",
  Configuration: "The sign-in service isn't set up correctly. Try again shortly, or tell a super admin.",
};

export default async function AuthErrorPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <AuthShell>
      <span className="mb-5 grid size-12 place-items-center rounded-2xl bg-lighterror text-error">
        <Icon icon="solar:danger-triangle-line-duotone" width={26} />
      </span>
      <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ld">We couldn&apos;t sign you in</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-darklink">
        {MESSAGES[error ?? ""] ?? "Something went wrong while signing you in. Try again."}
      </p>
      <Link
        href="/auth/auth2/login"
        className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-5 text-[15px] font-semibold text-white transition hover:bg-primaryemphasis"
      >
        Back to sign in
      </Link>
    </AuthShell>
  );
}
