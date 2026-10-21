"use client";

import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox, Label, TextInput } from "flowbite-react";
import { Button } from "@/app/components/shared/Button";
import { signIn } from "next-auth/react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { HiEye, HiEyeOff } from "react-icons/hi";
import {
  beginMfaSetup,
  confirmMfaSetup,
  setFirstPassword,
  startSignIn,
  type SignInStep,
} from "@/lib/staffAuth";

type Step = "credentials" | SignInStep | "backup_codes";

// Sign-in in steps: email and password, then (once) a new password and an
// authenticator set-up, then a 6-digit code at every sign-in.
const AuthLogin = () => {
  const [step, setStep] = React.useState<Step>("credentials");
  const [challenge, setChallenge] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [setup, setSetup] = React.useState<{ secret: string; otpauthUrl: string } | null>(null);
  const [code, setCode] = React.useState("");
  const [backupCodes, setBackupCodes] = React.useState<string[]>([]);
  const [savedCodes, setSavedCodes] = React.useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const go = (next: Step, nextChallenge: string) => {
    setChallenge(nextChallenge);
    setCode("");
    setStep(next);
  };

  const finish = async (finalChallenge: string, finalCode?: string) => {
    const result = await signIn("credentials", {
      challenge: finalChallenge,
      code: finalCode ?? "",
      redirect: false,
    });
    if (!result || result.error) {
      toast.error(result?.error || "Sign-in failed");
      return false;
    }
    const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
    window.location.href = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/";
    return true;
  };

  const run = async (work: () => Promise<void>) => {
    setBusy(true);
    try {
      await work();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const onCredentials = (values: LoginFormValues) =>
    run(async () => {
      const res = await startSignIn(values.email, values.password);
      if (!res.ok) return void toast.error(res.message);
      go(res.next, res.challenge);
    });

  const onNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 12) return toast.error("Use at least 12 characters");
    if (newPassword !== confirmPassword) return toast.error("The passwords don't match");
    run(async () => {
      const res = await setFirstPassword(challenge, newPassword);
      if (!res.ok) return void toast.error(res.message);
      toast.success("Password set");
      go(res.next, res.challenge);
    });
  };

  React.useEffect(() => {
    if (step !== "mfa_setup" || setup) return;
    run(async () => {
      const res = await beginMfaSetup(challenge);
      if (!res.ok) {
        toast.error(res.message);
        setStep("credentials");
        return;
      }
      setSetup({ secret: res.secret, otpauthUrl: res.otpauthUrl });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const onConfirmSetup = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      const res = await confirmMfaSetup(challenge, code.trim());
      if (!res.ok) return void toast.error(res.message);
      setBackupCodes(res.backupCodes);
      go("backup_codes", res.challenge);
    });
  };

  const onCode = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      await finish(challenge, code.trim());
    });
  };

  const restart = () => {
    setStep("credentials");
    setChallenge("");
    setSetup(null);
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const heading = (title: string, text?: string) => (
    <div className="mb-4 text-center">
      <p className="text-2xl font-bold">{title}</p>
      {text && <p className="text-sm text-darklink mt-2">{text}</p>}
    </div>
  );

  if (step === "change_password") {
    return (
      <form key="change_password" method="post" className="mt-6" onSubmit={onNewPassword}>
        {heading("Choose your password", "Replace the temporary password with your own. Use at least 12 characters.")}
        <div className="mb-4">
          <Label htmlFor="new-password" className="mb-2 block">New password</Label>
          <TextInput id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" required />
        </div>
        <div className="mb-6">
          <Label htmlFor="confirm-password" className="mb-2 block">Confirm new password</Label>
          <TextInput id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required />
        </div>
        <Button type="submit" color="primary" className="w-full" disabled={busy}>
          {busy ? "Saving..." : "Set password"}
        </Button>
        <button type="button" onClick={restart} className="w-full text-sm text-darklink mt-4">Start again</button>
      </form>
    );
  }

  if (step === "mfa_setup") {
    const grouped = setup?.secret.match(/.{1,4}/g)?.join(" ");
    return (
      <form key="mfa_setup" method="post" className="mt-6" onSubmit={onConfirmSetup}>
        {heading("Set up your authenticator app", "You'll enter a code from it every time you sign in.")}
        <ol className="text-sm text-darklink list-decimal ps-5 space-y-2 mb-4">
          <li>Open an authenticator app (Google Authenticator, Microsoft Authenticator, 1Password…).</li>
          <li>
            Add an account with this setup key
            {setup && (
              <>
                , or{" "}
                <a href={setup.otpauthUrl} className="text-primary font-medium">open it in the app</a> on this phone
              </>
            )}
            :
          </li>
        </ol>
        <div className="mb-4 rounded-md border border-ld bg-lightgray dark:bg-dark p-3 text-center font-mono text-base tracking-wider select-all break-all">
          {grouped || "Loading…"}
        </div>
        <div className="mb-6">
          <Label htmlFor="setup-code" className="mb-2 block">Then enter the 6-digit code it shows</Label>
          <TextInput id="setup-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} required />
        </div>
        <Button type="submit" color="primary" className="w-full" disabled={busy || !setup || code.length !== 6}>
          {busy ? "Checking..." : "Confirm"}
        </Button>
        <button type="button" onClick={restart} className="w-full text-sm text-darklink mt-4">Start again</button>
      </form>
    );
  }

  if (step === "backup_codes") {
    const download = () => {
      const blob = new Blob([`VillageSquare Admin backup codes\n\n${backupCodes.join("\n")}\n\nEach code works once.\n`], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "villagesquare-admin-backup-codes.txt";
      a.click();
      URL.revokeObjectURL(a.href);
    };
    return (
      <div className="mt-6">
        {heading("Save your backup codes", "If you lose your phone, each of these codes signs you in once. They won't be shown again.")}
        <div className="grid grid-cols-2 gap-2 mb-4 font-mono text-sm">
          {backupCodes.map((c) => (
            <div key={c} className="rounded border border-ld px-3 py-2 text-center">{c}</div>
          ))}
        </div>
        <div className="flex gap-2 mb-4">
          <Button color="light" className="flex-1" onClick={() => navigator.clipboard?.writeText(backupCodes.join("\n")).then(() => toast.success("Copied"))}>Copy</Button>
          <Button color="light" className="flex-1" onClick={download}>Download</Button>
        </div>
        <div className="flex items-center gap-2 mb-6">
          <Checkbox id="saved-codes" checked={savedCodes} onChange={(e) => setSavedCodes(e.target.checked)} />
          <Label htmlFor="saved-codes" className="font-normal">I&apos;ve saved these codes somewhere safe</Label>
        </div>
        <Button color="primary" className="w-full" disabled={busy || !savedCodes} onClick={() => run(async () => void (await finish(challenge)))}>
          {busy ? "Signing in..." : "Continue"}
        </Button>
      </div>
    );
  }

  if (step === "mfa") {
    return (
      <form key="mfa" method="post" className="mt-6" onSubmit={onCode}>
        {heading("Enter your code", "Open your authenticator app and enter the 6-digit code. Lost your phone? Use one of your backup codes.")}
        <div className="mb-6">
          <Label htmlFor="mfa-code" className="mb-2 block">Code</Label>
          <TextInput id="mfa-code" autoComplete="one-time-code" maxLength={9} value={code} onChange={(e) => setCode(e.target.value)} autoFocus required />
        </div>
        <Button type="submit" color="primary" className="w-full" disabled={busy || code.trim().length < 6}>
          {busy ? "Signing in..." : "Sign in"}
        </Button>
        <button type="button" onClick={restart} className="w-full text-sm text-darklink mt-4">Use a different account</button>
      </form>
    );
  }

  // POST: a submit before the page has loaded must never put the password
  // in the URL.
  return (
    <form
      key="credentials"
      method="post"
      className="mt-6"
      onSubmit={form.handleSubmit(onCredentials)}
    >
      {heading("Admin Dashboard")}
      <div className="mb-4">
        <div className="mb-2 block">
          <Label htmlFor="email">Email</Label>
        </div>
        <TextInput
          id="email"
          type="text"
          sizing="md"
          autoComplete="username"
          {...form.register("email")}
          className={`form-control ${form.formState.errors.email ? "border-red-500" : ""}`}
        />
        {form.formState.errors.email && (
          <p className="mt-1 text-sm text-red-500">{form.formState.errors.email.message}</p>
        )}
      </div>
      <div className="mb-4">
        <div className="mb-2 block">
          <Label htmlFor="password">Password</Label>
        </div>
        <div className="relative">
          <TextInput
            id="password"
            type={showPassword ? "text" : "password"}
            sizing="md"
            autoComplete="current-password"
            {...form.register("password")}
            className={`form-control ${form.formState.errors.password ? "border-red-500" : ""}`}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <HiEyeOff className="h-5 w-5 text-gray-500" /> : <HiEye className="h-5 w-5 text-gray-500" />}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="mt-1 text-sm text-red-500">{form.formState.errors.password.message}</p>
        )}
      </div>
      <Button type="submit" color="primary" className="w-full" disabled={busy}>
        {busy ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
};

export default AuthLogin;
