"use server";

// Sign-in steps before a session exists. Each answers the next step and a
// short-lived challenge; only the last step (next-auth's authorize) gets
// tokens, and those stay on the server.
const API_URL = (process.env.API_URL || "").replace(/\/+$/, "");

export type SignInStep = "change_password" | "mfa_setup" | "mfa" | "verified";
type StepResult = { ok: true; next: SignInStep; challenge: string } | { ok: false; message: string };

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
  return ok ? { ok, next: json.data.next, challenge: json.data.challenge } : failure(json, "Sign-in failed");
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

export async function confirmMfaSetup(challenge: string, code: string) {
  const { ok, json } = await post("auth/mfa/confirm", { challenge, code });
  return ok
    ? { ok: true as const, backupCodes: json.data.backup_codes as string[], challenge: json.data.challenge as string }
    : failure(json, "That code isn't right");
}
