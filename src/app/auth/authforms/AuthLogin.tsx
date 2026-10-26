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
import { QRCodeSVG } from "qrcode.react";
import { browserSupportsWebAuthn, startAuthentication, startRegistration } from "@simplewebauthn/browser";
import {
  beginMfaSetup,
  beginPasskeySetup,
  confirmMfaSetup,
  confirmPasskeySetup,
  passkeySignInOptions,
  sendEmailCode,
  setFirstPassword,
  startSignIn,
  type SignInMethods,
  type SignInStep,
} from "@/lib/staffAuth";

type Step = "credentials" | SignInStep | "backup_codes";

// Sign-in in steps: email and password, then (once) a new password and a
// second step (authenticator app or passkey), then that second step at every
// sign-in: a passkey, a code from an app or an email, or a backup code.
const AuthLogin = () => {
  const [step, setStep] = React.useState<Step>("credentials");
  const [challenge, setChallenge] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [setup, setSetup] = React.useState<{ secret: string; otpauthUrl: string } | null>(null);
  const [setupKind, setSetupKind] = React.useState<"authenticator" | "passkey" | null>(null);
  const [methodName, setMethodName] = React.useState("");
  const [methods, setMethods] = React.useState<SignInMethods | null>(null);
  const [emailSentTo, setEmailSentTo] = React.useState<string | null>(null);
  const [passkeysWork, setPasskeysWork] = React.useState(false);
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

  React.useEffect(() => setPasskeysWork(browserSupportsWebAuthn()), []);

  const finish = async (finalChallenge: string, finalCode?: string, passkey?: string) => {
    const result = await signIn("credentials", {
      challenge: finalChallenge,
      code: finalCode ?? "",
      passkey: passkey ?? "",
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
      setMethods(res.methods ?? null);
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
    if (step !== "mfa_setup" || setupKind !== "authenticator" || setup) return;
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
  }, [step, setupKind]);

  const onConfirmSetup = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      const res = await confirmMfaSetup(challenge, code.trim(), methodName.trim());
      if (!res.ok) return void toast.error(res.message);
      setBackupCodes(res.backupCodes);
      go("backup_codes", res.challenge);
    });
  };

  // The browser's own passkey prompt; cancelling it is not an error.
  const browserPasskey = async <T,>(work: () => Promise<T>): Promise<T | null> => {
    try {
      return await work();
    } catch (error) {
      const name = (error as { name?: string })?.name;
      toast.error(name === "NotAllowedError" ? "Passkey cancelled" : "Your browser couldn't use a passkey");
      return null;
    }
  };

  const onCreatePasskey = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      const begin = await beginPasskeySetup(challenge, window.location.origin);
      if (!begin.ok) return void toast.error(begin.message);
      const response = await browserPasskey(() => startRegistration({ optionsJSON: begin.options }));
      if (!response) return;
      const res = await confirmPasskeySetup(challenge, response, methodName.trim());
      if (!res.ok) return void toast.error(res.message);
      setBackupCodes(res.backupCodes);
      go("backup_codes", res.challenge);
    });
  };

  const onUsePasskey = () =>
    run(async () => {
      const begin = await passkeySignInOptions(challenge, window.location.origin);
      if (!begin.ok) return void toast.error(begin.message);
      const response = await browserPasskey(() => startAuthentication({ optionsJSON: begin.options }));
      if (!response) return;
      await finish(challenge, undefined, JSON.stringify(response));
    });

  const onEmailCode = (methodId?: string) =>
    run(async () => {
      const res = await sendEmailCode(challenge, methodId);
      if (!res.ok) return void toast.error(res.message);
      setEmailSentTo(res.sentTo);
      toast.success(`Code sent to ${res.sentTo}`);
    });

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
    setSetupKind(null);
    setMethodName("");
    setMethods(null);
    setEmailSentTo(null);
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

  if (step === "mfa_setup" && !setupKind) {
    const option = (kind: "authenticator" | "passkey", title: string, text: string, disabled = false) => (
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setMethodName(kind === "authenticator" ? "Authenticator app" : "Passkey");
          setSetupKind(kind);
        }}
        className="w-full text-left rounded-md border border-ld p-4 mb-3 hover:border-primary disabled:opacity-50 disabled:hover:border-ld"
      >
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-darklink mt-1">{text}</p>
      </button>
    );
    return (
      <div className="mt-6">
        {heading("Add a second step", "You'll use it every time you sign in, after your password. You can add more later under Security.")}
        {option("authenticator", "Authenticator app", "A 6-digit code from Google Authenticator, Microsoft Authenticator, 1Password or similar.")}
        {option(
          "passkey",
          "Passkey or security key",
          passkeysWork
            ? "Face ID, Touch ID, Windows Hello or a YubiKey. Nothing to type."
            : "This browser can't use passkeys. Use an authenticator app, or another browser.",
          !passkeysWork,
        )}
        <button type="button" onClick={restart} className="w-full text-sm text-darklink mt-2">Start again</button>
      </div>
    );
  }

  const nameField = (id: string, hint: string) => (
    <div className="mb-4">
      <Label htmlFor={id} className="mb-2 block">Name it</Label>
      <TextInput id={id} value={methodName} maxLength={60} onChange={(e) => setMethodName(e.target.value)} />
      <p className="text-xs text-darklink mt-1">{hint}</p>
    </div>
  );

  if (step === "mfa_setup" && setupKind === "passkey") {
    return (
      <form key="passkey_setup" method="post" className="mt-6" onSubmit={onCreatePasskey}>
        {heading("Set up a passkey", "Your browser will ask you to use Face ID, Touch ID, Windows Hello, your phone or a security key.")}
        {nameField("passkey-name", "So you can tell your passkeys apart, e.g. \"MacBook Touch ID\" or \"YubiKey\".")}
        <Button type="submit" color="primary" className="w-full" disabled={busy}>
          {busy ? "Waiting for your passkey..." : "Create passkey"}
        </Button>
        <button type="button" onClick={() => setSetupKind(null)} className="w-full text-sm text-darklink mt-4">Choose another way</button>
      </form>
    );
  }

  if (step === "mfa_setup") {
    const grouped = setup?.secret.match(/.{1,4}/g)?.join(" ");
    return (
      <form key="mfa_setup" method="post" className="mt-6" onSubmit={onConfirmSetup}>
        {heading("Set up your authenticator app", "Scan the QR code with an authenticator app (Google Authenticator, Microsoft Authenticator, 1Password…).")}
        <div className="flex justify-center mb-3">
          <div className="rounded-md bg-white p-3">
            {setup ? (
              <QRCodeSVG value={setup.otpauthUrl} size={176} level="M" title="Authenticator app QR code" />
            ) : (
              <div className="h-[176px] w-[176px] grid place-items-center text-sm text-gray-500">Loading…</div>
            )}
          </div>
        </div>
        <p className="text-sm text-darklink text-center mb-2">
          Can&apos;t scan it? Add an account with this setup key
          {setup && (
            <>
              , or <a href={setup.otpauthUrl} className="text-primary font-medium">open it in the app</a> on this phone
            </>
          )}
          :
        </p>
        <div className="mb-4 rounded-md border border-ld bg-lightgray dark:bg-dark p-3 text-center font-mono text-base tracking-wider select-all break-all">
          {grouped || "Loading…"}
        </div>
        {nameField("setup-name", "So you can tell your apps apart, e.g. \"Work phone\".")}
        <div className="mb-6">
          <Label htmlFor="setup-code" className="mb-2 block">Then enter the 6-digit code it shows</Label>
          <TextInput id="setup-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} required />
        </div>
        <Button type="submit" color="primary" className="w-full" disabled={busy || !setup || code.length !== 6}>
          {busy ? "Checking..." : "Confirm"}
        </Button>
        <button
          type="button"
          onClick={() => {
            setSetupKind(null);
            setSetup(null);
            setCode("");
          }}
          className="w-full text-sm text-darklink mt-4"
        >
          Choose another way
        </button>
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
    const usePasskey = !!methods?.passkey && passkeysWork;
    const emails = methods?.email ?? [];
    const codeHint = [
      methods?.authenticator ? "your authenticator app" : null,
      emails.length ? "the email we send you" : null,
    ]
      .filter(Boolean)
      .join(" or ");
    return (
      <form key="mfa" method="post" className="mt-6" onSubmit={onCode}>
        {heading("Confirm it's you", usePasskey ? "Use your passkey, or enter a code." : `Enter the 6-digit code from ${codeHint || "your authenticator app"}.`)}
        {usePasskey && (
          <>
            <Button type="button" color="primary" className="w-full" disabled={busy} onClick={onUsePasskey}>
              {busy ? "Waiting for your passkey..." : "Use passkey"}
            </Button>
            <div className="flex items-center gap-3 my-5 text-xs text-darklink">
              <span className="h-px flex-1 bg-border dark:bg-darkborder" />
              or enter a code
              <span className="h-px flex-1 bg-border dark:bg-darkborder" />
            </div>
          </>
        )}
        <div className="mb-2">
          <Label htmlFor="mfa-code" className="mb-2 block">Code</Label>
          <TextInput id="mfa-code" autoComplete="one-time-code" maxLength={9} value={code} onChange={(e) => setCode(e.target.value)} autoFocus={!usePasskey} />
        </div>
        {emails.length > 0 && (
          <div className="mb-2 text-sm">
            {emailSentTo ? (
              <p className="text-darklink">We sent a code to {emailSentTo}. It works for 10 minutes.</p>
            ) : null}
            {emails.map((m) => (
              <button key={m.uuid} type="button" disabled={busy} onClick={() => onEmailCode(m.uuid)} className="text-primary font-medium me-3">
                {emailSentTo ? "Send another code" : `Email me a code${emails.length > 1 ? ` (${m.sent_to})` : ""}`}
              </button>
            ))}
          </div>
        )}
        <p className="text-xs text-darklink mb-6">Lost your phone? Enter one of your backup codes.</p>
        <Button type="submit" color={usePasskey ? "light" : "primary"} className="w-full" disabled={busy || code.trim().length < 6}>
          {busy && !usePasskey ? "Signing in..." : "Sign in with code"}
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
