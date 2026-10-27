"use client";

import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { Checkbox } from "flowbite-react";
import { signIn } from "next-auth/react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { AuthButton, AuthField, AuthHeading, OrDivider, SetupProgress, TextAction } from "./AuthUi";
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

  const copy = (text: string) => navigator.clipboard?.writeText(text).then(() => toast.success("Copied"));

  const footerAction = (label: string, onClick: () => void) => (
    <div className="mt-6 text-center">
      <TextAction onClick={onClick}>{label}</TextAction>
    </div>
  );

  if (step === "change_password") {
    const rules = [
      { ok: newPassword.length >= 12, text: "At least 12 characters" },
      { ok: !!confirmPassword && newPassword === confirmPassword, text: "Both passwords match" },
    ];
    return (
      <form key="change_password" method="post" onSubmit={onNewPassword}>
        <SetupProgress step={1} />
        <AuthHeading title="Choose your password" text="Replace the temporary password with one only you know." />
        <AuthField id="new-password" label="New password" icon="solar:lock-password-line-duotone" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" required />
        <AuthField id="confirm-password" label="Confirm new password" icon="solar:lock-password-line-duotone" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required />
        <ul className="-mt-1 mb-7 space-y-1.5 text-sm">
          {rules.map((r) => (
            <li key={r.text} className={`flex items-center gap-2 ${r.ok ? "text-success" : "text-darklink"}`}>
              <Icon icon={r.ok ? "solar:check-circle-bold" : "solar:record-circle-line-duotone"} width={17} />
              {r.text}
            </li>
          ))}
        </ul>
        <AuthButton type="submit" busy={busy}>{busy ? "Saving…" : "Set password"}</AuthButton>
        {footerAction("Start again", restart)}
      </form>
    );
  }

  if (step === "mfa_setup" && !setupKind) {
    const option = (kind: "authenticator" | "passkey", icon: string, title: string, text: string, disabled = false) => (
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setMethodName(kind === "authenticator" ? "Authenticator app" : "Passkey");
          setSetupKind(kind);
        }}
        className="group flex w-full items-center gap-4 rounded-2xl border border-border p-4 text-left transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border dark:border-darkborder dark:hover:border-primary dark:disabled:hover:border-darkborder"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-lightprimary text-primary">
          <Icon icon={icon} width={22} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-ld">{title}</span>
          <span className="mt-0.5 block text-sm leading-snug text-darklink">{text}</span>
        </span>
        <Icon icon="solar:alt-arrow-right-linear" width={18} className="shrink-0 text-darklink transition group-hover:translate-x-0.5 group-hover:text-primary group-disabled:translate-x-0 group-disabled:text-darklink" />
      </button>
    );
    return (
      <div key="mfa_choose">
        <SetupProgress step={2} />
        <AuthHeading title="Add a second step" text="You'll use it every time you sign in, after your password. You can add more later under Security." />
        <div className="space-y-3">
          {option("authenticator", "solar:smartphone-2-line-duotone", "Authenticator app", "A 6-digit code from Google Authenticator, Microsoft Authenticator, 1Password or similar.")}
          {option(
            "passkey",
            "solar:key-minimalistic-square-line-duotone",
            "Passkey or security key",
            passkeysWork
              ? "Face ID, Touch ID, Windows Hello or a YubiKey. Nothing to type."
              : "This browser can't use passkeys. Use an authenticator app, or another browser.",
            !passkeysWork,
          )}
        </div>
        {footerAction("Start again", restart)}
      </div>
    );
  }

  const nameField = (id: string, hint: string) => (
    <AuthField id={id} label="Name it" icon="solar:tag-horizontal-line-duotone" value={methodName} maxLength={60} onChange={(e) => setMethodName(e.target.value)} hint={hint} />
  );

  if (step === "mfa_setup" && setupKind === "passkey") {
    return (
      <form key="passkey_setup" method="post" onSubmit={onCreatePasskey}>
        <SetupProgress step={2} />
        <AuthHeading title="Set up a passkey" text="Your browser will ask you to use Face ID, Touch ID, Windows Hello, your phone or a security key." />
        {nameField("passkey-name", "So you can tell your passkeys apart, e.g. \"MacBook Touch ID\" or \"YubiKey\".")}
        <AuthButton type="submit" busy={busy} icon="solar:key-minimalistic-square-line-duotone" className="mt-2">
          {busy ? "Waiting for your passkey…" : "Create passkey"}
        </AuthButton>
        {footerAction("Choose another way", () => setSetupKind(null))}
      </form>
    );
  }

  if (step === "mfa_setup") {
    const grouped = setup?.secret.match(/.{1,4}/g)?.join(" ");
    return (
      <form key="mfa_setup" method="post" onSubmit={onConfirmSetup}>
        <SetupProgress step={2} />
        <AuthHeading title="Set up your authenticator app" text="Scan the QR code with Google Authenticator, Microsoft Authenticator, 1Password or similar." />
        <div className="mb-6 flex flex-col items-center gap-5 rounded-2xl border border-border bg-lightgray p-5 dark:border-darkborder dark:bg-darkgray sm:flex-row sm:items-start">
          <div className="shrink-0 rounded-xl bg-white p-2.5 ring-1 ring-black/5">
            {setup ? (
              <QRCodeSVG value={setup.otpauthUrl} size={140} level="M" title="Authenticator app QR code" />
            ) : (
              <div className="grid size-[140px] place-items-center text-sm text-gray-500">Loading…</div>
            )}
          </div>
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-semibold text-ld">Can&apos;t scan it?</p>
            <p className="mt-1 leading-relaxed text-darklink">
              Add an account with this setup key
              {setup && (
                <>
                  , or <a href={setup.otpauthUrl} className="font-medium text-primary hover:underline">open it in the app</a> on this phone
                </>
              )}
              .
            </p>
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-border bg-white px-3 py-2 dark:border-darkborder dark:bg-dark">
              <span className="min-w-0 flex-1 select-all break-all font-mono text-[13px] leading-relaxed tracking-wide text-ld">{grouped || "Loading…"}</span>
              {setup && (
                <button type="button" aria-label="Copy the setup key" onClick={() => copy(setup.secret)} className="mt-0.5 text-darklink transition hover:text-primary">
                  <Icon icon="solar:copy-line-duotone" width={17} />
                </button>
              )}
            </div>
          </div>
        </div>
        {nameField("setup-name", "So you can tell your apps apart, e.g. \"Work phone\".")}
        <AuthField
          id="setup-code"
          label="Then enter the 6-digit code it shows"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          required
          placeholder="000000"
          className="text-center font-mono text-xl tracking-[0.4em]"
        />
        <AuthButton type="submit" busy={busy} disabled={!setup || code.length !== 6} className="mt-2">
          {busy ? "Checking…" : "Confirm"}
        </AuthButton>
        {footerAction("Choose another way", () => {
          setSetupKind(null);
          setSetup(null);
          setCode("");
        })}
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
      <div key="backup_codes">
        <SetupProgress step={3} />
        <AuthHeading title="Save your backup codes" text="If you lose your phone, each of these codes signs you in once. They won't be shown again." />
        <ol className="mb-4 grid grid-cols-2 gap-x-6 gap-y-2.5 rounded-2xl border border-border bg-lightgray p-5 font-mono text-[15px] text-ld dark:border-darkborder dark:bg-darkgray">
          {backupCodes.map((c, i) => (
            <li key={c} className="flex items-center gap-3">
              <span className="w-5 text-right font-sans text-xs text-darklink">{i + 1}</span>
              {c}
            </li>
          ))}
        </ol>
        <div className="mb-6 grid grid-cols-2 gap-3">
          <AuthButton type="button" variant="secondary" icon="solar:copy-line-duotone" onClick={() => copy(backupCodes.join("\n"))}>Copy</AuthButton>
          <AuthButton type="button" variant="secondary" icon="solar:download-minimalistic-line-duotone" onClick={download}>Download</AuthButton>
        </div>
        <label htmlFor="saved-codes" className="mb-6 flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 text-sm text-ld dark:border-darkborder">
          <Checkbox id="saved-codes" checked={savedCodes} onChange={(e) => setSavedCodes(e.target.checked)} />
          I&apos;ve saved these codes somewhere safe
        </label>
        <AuthButton type="button" busy={busy} disabled={!savedCodes} onClick={() => run(async () => void (await finish(challenge)))}>
          {busy ? "Signing in…" : "Continue"}
        </AuthButton>
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
      <form key="mfa" method="post" onSubmit={onCode}>
        <AuthHeading
          eyebrow={
            <span className="mb-5 grid size-12 place-items-center rounded-2xl bg-lightprimary text-primary">
              <Icon icon="solar:shield-keyhole-line-duotone" width={26} />
            </span>
          }
          title="Confirm it's you"
          text={usePasskey ? "Use your passkey, or enter a code." : `Enter the 6-digit code from ${codeHint || "your authenticator app"}.`}
        />
        {usePasskey && (
          <>
            <AuthButton type="button" busy={busy} icon="solar:key-minimalistic-square-line-duotone" onClick={onUsePasskey}>
              {busy ? "Waiting for your passkey…" : "Use passkey"}
            </AuthButton>
            <OrDivider>or enter a code</OrDivider>
          </>
        )}
        <AuthField
          id="mfa-code"
          label="Code"
          autoComplete="one-time-code"
          maxLength={9}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoFocus={!usePasskey}
          placeholder="000000"
          className="text-center font-mono text-xl tracking-[0.3em]"
          hint="Lost your phone? Enter one of your backup codes."
        />
        {emails.length > 0 && (
          <div className="-mt-2 mb-6 text-sm">
            {emailSentTo && <p className="mb-1 text-darklink">We sent a code to {emailSentTo}. It works for 10 minutes.</p>}
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {emails.map((m) => (
                <button key={m.uuid} type="button" disabled={busy} onClick={() => onEmailCode(m.uuid)} className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline disabled:opacity-50">
                  <Icon icon="solar:letter-line-duotone" width={17} />
                  {emailSentTo ? "Send another code" : `Email me a code${emails.length > 1 ? ` (${m.sent_to})` : ""}`}
                </button>
              ))}
            </div>
          </div>
        )}
        <AuthButton type="submit" variant={usePasskey ? "secondary" : "primary"} busy={busy && !usePasskey} disabled={busy || code.trim().length < 6} className="mt-2">
          {busy && !usePasskey ? "Signing in…" : "Sign in with code"}
        </AuthButton>
        {footerAction("Use a different account", restart)}
      </form>
    );
  }

  const errors = form.formState.errors;
  // POST: a submit before the page has loaded must never put the password
  // in the URL.
  return (
    <form key="credentials" method="post" noValidate onSubmit={form.handleSubmit(onCredentials)}>
      <AuthHeading title="Sign in" text="Welcome back. Sign in to the VillageSquare staff console." />
      <AuthField
        id="email"
        label="Email"
        icon="solar:letter-line-duotone"
        type="email"
        autoComplete="username"
        placeholder="Your work email"
        error={errors.email?.message}
        {...form.register("email")}
      />
      <AuthField
        id="password"
        label="Password"
        icon="solar:lock-password-line-duotone"
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        placeholder="Your password"
        error={errors.password?.message}
        trailing={
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword(!showPassword)}
            className="grid size-9 place-items-center rounded-lg text-darklink transition hover:text-ld"
          >
            <Icon icon={showPassword ? "solar:eye-closed-line-duotone" : "solar:eye-line-duotone"} width={20} />
          </button>
        }
        {...form.register("password")}
      />
      <AuthButton type="submit" busy={busy} className="mt-2">
        {busy ? "Signing in…" : "Sign in"}
      </AuthButton>
      <p className="mt-8 text-center text-sm leading-relaxed text-darklink">
        Can&apos;t sign in? Ask a super admin to reset your password or second step.
      </p>
    </form>
  );
};

export default AuthLogin;
