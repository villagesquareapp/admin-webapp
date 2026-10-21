"use server";

// Sign-in steps before a session exists. Each answers the next step and a
// short-lived challenge; only the last step (next-auth's authorize) gets
// tokens, and those stay on the server.
const API_URL = (process.env.API_URL || "").replace(/\/+$/, "");

export type SignInStep = "change_password" | "mfa_setup" | "mfa" | "verified";
// Which second steps the account has, for the code screen.
export type SignInMethods = {
  authenticator: boolean;
  passkey: boolean;
  email: { uuid: string; name: string; sent_to: string }[];
};
type StepResult =
  | { ok: true; next: SignInStep; challenge: string; methods?: SignInMethods }
  | { ok: false; message: string };

async function post(route: string, body: unknown) {
  try {
    const response = await fetch(`${API_URL}/${route}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const json = await response.json().catch(() => null);
    return { ok: response.ok && json?.status !== false, json };
  } catch {
    return { ok: false, json: { message: "The admin service is unavailable. Try again shortly." } };
  }
}

const failure = (json: any, fallback: string) => ({
  ok: false as const,
  message: (Array.isArray(json?.message) ? json.message[0] : json?.message) || fallback,
});

export async function startSignIn(email: string, password: string): Promise<StepResult> {
  const { ok, json } = await post("auth/login", { email, password });
  return ok
    ? { ok, next: json.data.next, challenge: json.data.challenge, methods: json.data.methods }
    : failure(json, "Sign-in failed");
}

export async function setFirstPassword(challenge: string, newPassword: string): Promise<StepResult> {
  const { ok, json } = await post("auth/first-password", { challenge, new_password: newPassword });
  return ok ? { ok, next: json.data.next, challenge: json.data.challenge } : failure(json, "Couldn't set the password");
}

export async function beginMfaSetup(challenge: string) {
  const { ok, json } = await post("auth/mfa/setup", { challenge });
  return ok
    ? { ok: true as const, secret: json.data.secret as string, otpauthUrl: json.data.otpauth_url as string }
    : failure(json, "Couldn't start the authenticator set-up");
}

export async function confirmMfaSetup(challenge: string, code: string, name?: string) {
  const { ok, json } = await post("auth/mfa/confirm", { challenge, code, ...(name ? { name } : {}) });
  return ok
    ? { ok: true as const, backupCodes: json.data.backup_codes as string[], challenge: json.data.challenge as string }
    : failure(json, "That code isn't right");
}

// Passkey options come as a JSON string (the API snake_cases its responses;
// WebAuthn needs its own key names). Answers go back as the browser made them.
export async function beginPasskeySetup(challenge: string, origin: string) {
  const { ok, json } = await post("auth/mfa/passkey/setup-options", { challenge, origin });
  return ok
    ? { ok: true as const, options: JSON.parse(json.data.options_json) }
    : failure(json, "Couldn't start the passkey set-up");
}

export async function confirmPasskeySetup(challenge: string, response: unknown, name?: string) {
  const { ok, json } = await post("auth/mfa/passkey/setup", { challenge, response, ...(name ? { name } : {}) });
  return ok
    ? { ok: true as const, backupCodes: json.data.backup_codes as string[], challenge: json.data.challenge as string }
    : failure(json, "The passkey couldn't be set up");
}

export async function passkeySignInOptions(challenge: string, origin: string) {
  const { ok, json } = await post("auth/mfa/passkey/options", { challenge, origin });
  return ok
    ? { ok: true as const, options: JSON.parse(json.data.options_json) }
    : failure(json, "Couldn't start the passkey sign-in");
}

export async function sendEmailCode(challenge: string, methodId?: string) {
  const { ok, json } = await post("auth/mfa/email", { challenge, ...(methodId ? { method_id: methodId } : {}) });
  return ok ? { ok: true as const, sentTo: json.data.sent_to as string } : failure(json, "Couldn't send the code");
}
