"use client";

import React from "react";
import { Label, TextInput } from "flowbite-react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Icon } from "@iconify/react";
import { QRCodeSVG } from "qrcode.react";
import { browserSupportsWebAuthn, startRegistration } from "@simplewebauthn/browser";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import { Button } from "@/app/components/shared/Button";
import { formatDate } from "@/utils/dateUtils";
import {
  addPasskey,
  confirmAuthenticator,
  confirmEmailCodes,
  getSecurity,
  makeNewBackupCodes,
  passkeyOptions,
  removeSignInMethod,
  renameSignInMethod,
  startAuthenticator,
  startEmailCodes,
} from "@/app/api/security";

const KINDS: Record<ISignInMethod["type"], { label: string; icon: string }> = {
  authenticator: { label: "Authenticator app", icon: "solar:smartphone-2-linear" },
  passkey: { label: "Passkey or security key", icon: "solar:key-minimalistic-square-linear" },
  email: { label: "Email codes", icon: "solar:letter-linear" },
};

type Flow =
  | { kind: "authenticator"; step: "password" | "scan"; secret?: string; otpauthUrl?: string }
  | { kind: "passkey" }
  | { kind: "email"; step: "password" | "code"; sentTo?: string }
  | { kind: "remove"; method: ISignInMethod }
  | { kind: "backup"; codes?: string[] };

const isStrong = (m: ISignInMethod) => m.type !== "email";

const SecurityComp = ({ initial }: { initial: ISecurityOverview | null }) => {
  const [overview, setOverview] = React.useState<ISecurityOverview | null>(initial);
  const [flow, setFlow] = React.useState<Flow | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [renaming, setRenaming] = React.useState<{ uuid: string; name: string } | null>(null);
  const [passkeysWork, setPasskeysWork] = React.useState(false);

  React.useEffect(() => setPasskeysWork(browserSupportsWebAuthn()), []);

  const methods = overview?.methods ?? [];
  const strongCount = methods.filter(isStrong).length;

  const reload = async () => {
    const res = await getSecurity();
    if (res?.status && res.data) setOverview(res.data);
  };

  const open = (next: Flow, defaultName = "") => {
    setPassword("");
    setCode("");
    setEmail("");
    setName(defaultName);
    setFlow(next);
  };

  const close = () => {
    if (!busy) setFlow(null);
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

  const added = async (message: string) => {
    toast.success(message);
    setFlow(null);
    await reload();
  };

  const onAuthenticator = (e: React.FormEvent) => {
    e.preventDefault();
    if (flow?.kind !== "authenticator") return;
    run(async () => {
      if (flow.step === "password") {
        const res = await startAuthenticator(password);
        if (!res.status || !res.data) return void toast.error(res.message);
        setFlow({ kind: "authenticator", step: "scan", secret: res.data.secret, otpauthUrl: res.data.otpauth_url });
        return;
      }
      const res = await confirmAuthenticator(code.trim(), name.trim());
      if (!res.status) return void toast.error(res.message);
      await added("Authenticator app added");
    });
  };

  const onPasskey = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      const res = await passkeyOptions(password, window.location.origin);
      if (!res.status || !res.data) return void toast.error(res.message);
      let response: unknown;
      try {
        response = await startRegistration({ optionsJSON: JSON.parse(res.data.options_json) });
      } catch (error) {
        const errName = (error as { name?: string })?.name;
        return void toast.error(
          errName === "InvalidStateError"
            ? "That passkey is already added"
            : errName === "NotAllowedError"
              ? "Passkey cancelled"
              : "Your browser couldn't create a passkey",
        );
      }
      const saved = await addPasskey(response, name.trim());
      if (!saved.status) return void toast.error(saved.message);
      await added("Passkey added");
    });
  };

  const onEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (flow?.kind !== "email") return;
    run(async () => {
      if (flow.step === "password") {
        const res = await startEmailCodes(password, email.trim());
        if (!res.status || !res.data) return void toast.error(res.message);
        setFlow({ kind: "email", step: "code", sentTo: res.data.sent_to });
        return;
      }
      const res = await confirmEmailCodes(code.trim(), name.trim());
      if (!res.status) return void toast.error(res.message);
      await added("Email codes added");
    });
  };

  const onRemove = (e: React.FormEvent) => {
    e.preventDefault();
    if (flow?.kind !== "remove") return;
    run(async () => {
      const res = await removeSignInMethod(flow.method.uuid, password);
      if (!res.status) return void toast.error(res.message);
      await added(`"${flow.method.name}" removed`);
    });
  };

  const onBackup = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      const res = await makeNewBackupCodes(password);
      if (!res.status || !res.data) return void toast.error(res.message);
      setFlow({ kind: "backup", codes: res.data.backup_codes });
      await reload();
    });
  };

  const onRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renaming) return;
    run(async () => {
      const res = await renameSignInMethod(renaming.uuid, renaming.name.trim());
      if (!res.status) return void toast.error(res.message);
      setRenaming(null);
      toast.success("Renamed");
      await reload();
    });
  };

  const passwordField = (
    <div className="mb-4">
      <Label htmlFor="security-password" className="mb-2 block">Your password</Label>
      <TextInput
        id="security-password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoFocus
      />
    </div>
  );

  const nameField = (hint: string) => (
    <div className="mb-4">
      <Label htmlFor="security-name" className="mb-2 block">Name it</Label>
      <TextInput id="security-name" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
      <p className="text-xs text-darklink mt-1">{hint}</p>
    </div>
  );

  const codeField = (label: string) => (
    <div className="mb-4">
      <Label htmlFor="security-code" className="mb-2 block">{label}</Label>
      <TextInput
        id="security-code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        required
      />
    </div>
  );

  const actions = (submit: string, disabled = false) => (
    <div className="flex justify-end gap-3 mt-6">
      <Button type="button" color="gray" onClick={close} disabled={busy}>
        Cancel
      </Button>
      <Button type="submit" color="primary" disabled={busy || disabled}>
        {busy ? "Working..." : submit}
      </Button>
    </div>
  );

  const backupCodesBlock = (codes: string[]) => {
    const download = () => {
      const blob = new Blob([`VillageSquare Admin backup codes\n\n${codes.join("\n")}\n\nEach code works once.\n`], {
        type: "text/plain",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "villagesquare-admin-backup-codes.txt";
      a.click();
      URL.revokeObjectURL(a.href);
    };
    return (
      <>
        <p className="text-sm text-darklink mb-4">
          Each code signs you in once if you can&apos;t use your other methods. They won&apos;t be shown again, and
          your old codes no longer work.
        </p>
        <div className="grid grid-cols-2 gap-2 mb-4 font-mono text-sm">
          {codes.map((c) => (
            <div key={c} className="rounded border border-ld px-3 py-2 text-center">{c}</div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            color="light"
            className="flex-1"
            onClick={() => navigator.clipboard?.writeText(codes.join("\n")).then(() => toast.success("Copied"))}
          >
            Copy
          </Button>
          <Button type="button" color="light" className="flex-1" onClick={download}>
            Download
          </Button>
          <Button type="button" color="primary" className="flex-1" onClick={() => setFlow(null)}>
            Done
          </Button>
        </div>
      </>
    );
  };

  const dialogBody = () => {
    if (!flow) return null;
    if (flow.kind === "authenticator") {
      if (flow.step === "password") {
        return (
          <form method="post" onSubmit={onAuthenticator}>
            <p className="text-sm text-darklink mb-4">Confirm your password to add an authenticator app.</p>
            {passwordField}
            {actions("Continue")}
          </form>
        );
      }
      const grouped = flow.secret?.match(/.{1,4}/g)?.join(" ");
      return (
        <form method="post" onSubmit={onAuthenticator}>
          <p className="text-sm text-darklink mb-3">Scan this QR code with the authenticator app.</p>
          <div className="flex justify-center mb-3">
            <div className="rounded-md bg-white p-3">
              <QRCodeSVG value={flow.otpauthUrl ?? ""} size={176} level="M" title="Authenticator app QR code" />
            </div>
          </div>
          <p className="text-sm text-darklink text-center mb-2">Can&apos;t scan it? Type this setup key:</p>
          <div className="mb-4 rounded-md border border-ld bg-lightgray dark:bg-dark p-3 text-center font-mono tracking-wider select-all break-all">
            {grouped}
          </div>
          {nameField('So you can tell your apps apart, e.g. "Work phone".')}
          {codeField("Then enter the 6-digit code it shows")}
          {actions("Add", code.length !== 6)}
        </form>
      );
    }
    if (flow.kind === "passkey") {
      return (
        <form method="post" onSubmit={onPasskey}>
          <p className="text-sm text-darklink mb-4">
            Your browser will ask you to use Face ID, Touch ID, Windows Hello, your phone or a security key.
          </p>
          {passwordField}
          {nameField('e.g. "MacBook Touch ID" or "YubiKey".')}
          {actions("Create passkey")}
        </form>
      );
    }
    if (flow.kind === "email") {
      if (flow.step === "password") {
        return (
          <form method="post" onSubmit={onEmail}>
            <p className="text-sm text-darklink mb-4">
              We&apos;ll email a code to the address to check it&apos;s yours. Email codes are an extra way in; you
              always keep an authenticator app or passkey too.
            </p>
            {passwordField}
            <div className="mb-4">
              <Label htmlFor="security-email" className="mb-2 block">Email address</Label>
              <TextInput id="security-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            {actions("Send code")}
          </form>
        );
      }
      return (
        <form method="post" onSubmit={onEmail}>
          <p className="text-sm text-darklink mb-4">We sent a 6-digit code to {flow.sentTo}. It works for 10 minutes.</p>
          {codeField("Code")}
          {nameField('e.g. "Work email".')}
          {actions("Add", code.length !== 6)}
        </form>
      );
    }
    if (flow.kind === "remove") {
      return (
        <form method="post" onSubmit={onRemove}>
          <p className="text-sm text-darklink mb-4">
            &quot;{flow.method.name}&quot; will no longer work at sign-in. Confirm your password to remove it.
          </p>
          {passwordField}
          {actions("Remove")}
        </form>
      );
    }
    if (flow.codes) return backupCodesBlock(flow.codes);
    return (
      <form method="post" onSubmit={onBackup}>
        <p className="text-sm text-darklink mb-4">
          New codes replace your old ones straight away. Confirm your password to make them.
        </p>
        {passwordField}
        {actions("Make new codes")}
      </form>
    );
  };

  const dialogTitle = !flow
    ? ""
    : flow.kind === "remove"
      ? "Remove sign-in method"
      : flow.kind === "backup"
        ? "New backup codes"
        : `Add ${KINDS[flow.kind].label.toLowerCase()}`;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-lg font-bold">Security</h4>
        <p className="text-sm text-darklink">
          After your password, you prove it&apos;s you with one of these. Add more than one so losing a phone
          doesn&apos;t lock you out. Every change is emailed to you.
        </p>
      </div>

      <CardBox>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h5 className="text-base font-semibold">Sign-in methods</h5>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" color="light" onClick={() => open({ kind: "authenticator", step: "password" }, "Authenticator app")}>
              Add authenticator app
            </Button>
            <Button
              size="sm"
              color="light"
              disabled={!passkeysWork}
              title={passkeysWork ? undefined : "This browser can't use passkeys"}
              onClick={() => open({ kind: "passkey" }, "Passkey")}
            >
              Add passkey
            </Button>
            <Button size="sm" color="light" onClick={() => open({ kind: "email", step: "password" }, "Email")}>
              Add email codes
            </Button>
          </div>
        </div>

        {!overview ? (
          <p className="text-sm text-error">Your sign-in methods couldn&apos;t be loaded. Refresh to try again.</p>
        ) : (
          <div className="flex flex-col">
            {methods.map((m) => {
              const lastStrong = isStrong(m) && strongCount === 1;
              return (
                <div key={m.uuid} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-ld py-3 last:border-b-0">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-lightprimary text-primary grid place-items-center">
                    <Icon icon={KINDS[m.type].icon} height={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    {renaming?.uuid === m.uuid ? (
                      <form method="post" onSubmit={onRename} className="flex gap-2 items-center">
                        <TextInput
                          sizing="sm"
                          value={renaming.name}
                          maxLength={60}
                          autoFocus
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => setRenaming({ uuid: m.uuid, name: e.target.value })}
                        />
                        <Button size="xs" color="primary" type="submit" disabled={busy || !renaming.name.trim()}>
                          Save
                        </Button>
                        <Button size="xs" color="gray" type="button" onClick={() => setRenaming(null)}>
                          Cancel
                        </Button>
                      </form>
                    ) : (
                      <p className="text-sm font-semibold truncate">{m.name}</p>
                    )}
                    <p className="text-xs text-darklink">
                      {KINDS[m.type].label}
                      {m.email ? ` · ${m.email}` : ""} · Added {formatDate(m.created_at)} ·{" "}
                      {m.last_used_at ? `Last used ${formatDate(m.last_used_at)}` : "Not used yet"}
                    </p>
                  </div>
                  {renaming?.uuid !== m.uuid && (
                    <div className="flex gap-2">
                      <Button size="xs" color="light" onClick={() => setRenaming({ uuid: m.uuid, name: m.name })}>
                        Rename
                      </Button>
                      <Button
                        size="xs"
                        color="light"
                        disabled={lastStrong}
                        title={lastStrong ? "Add another authenticator app or passkey first" : undefined}
                        onClick={() => open({ kind: "remove", method: m })}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
            {strongCount === 1 && (
              <p className="text-xs text-darklink mt-3">
                You always keep at least one authenticator app or passkey. Add another before removing this one.
              </p>
            )}
          </div>
        )}
      </CardBox>

      <CardBox>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h5 className="text-base font-semibold">Backup codes</h5>
            <p className="text-sm text-darklink">
              {overview
                ? `${overview.backup_codes_left} of 10 left. Each one signs you in once if you can't use your other methods.`
                : "Each one signs you in once if you can't use your other methods."}
            </p>
          </div>
          <Button size="sm" color="light" onClick={() => open({ kind: "backup" })}>
            Make new codes
          </Button>
        </div>
      </CardBox>

      <Dialog open={!!flow} onClose={close} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
          <DialogPanel className="w-full max-w-md p-6 bg-white dark:bg-darkgray rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <DialogTitle className="text-xl font-semibold">{dialogTitle}</DialogTitle>
              <button type="button" onClick={close} className="text-gray-500 hover:text-gray-800" aria-label="Close">
                ✕
              </button>
            </div>
            {dialogBody()}
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
};

export default SecurityComp;
