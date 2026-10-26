"use server";

import { apiGet, apiPatch, apiPost } from "@/lib/api";
import { getToken } from "@/lib/getToken";

// The signed-in staff member's own sign-in methods. Adding, removing and new
// backup codes ask for the password again.

export const getSecurity = async () => {
  const token = await getToken();
  return await apiGet<ISecurityOverview>(`account/security`, token);
};

export const startAuthenticator = async (password: string) => {
  const token = await getToken();
  return await apiPost<{ secret: string; otpauth_url: string }>(`account/security/authenticators`, { password }, token);
};

export const confirmAuthenticator = async (code: string, name: string) => {
  const token = await getToken();
  return await apiPost<ISignInMethod>(`account/security/authenticators/confirm`, { code, name }, token);
};

// Passkey options come as a JSON string; see staffAuth.ts.
export const passkeyOptions = async (password: string, origin: string) => {
  const token = await getToken();
  return await apiPost<{ options_json: string }>(`account/security/passkeys/options`, { password, origin }, token);
};

export const addPasskey = async (response: unknown, name: string) => {
  const token = await getToken();
  return await apiPost<ISignInMethod>(`account/security/passkeys`, { response, name }, token);
};

export const startEmailCodes = async (password: string, email: string) => {
  const token = await getToken();
  return await apiPost<{ sent_to: string }>(`account/security/emails`, { password, email }, token);
};

export const confirmEmailCodes = async (code: string, name: string) => {
  const token = await getToken();
  return await apiPost<ISignInMethod>(`account/security/emails/confirm`, { code, name }, token);
};

export const renameSignInMethod = async (uuid: string, name: string) => {
  const token = await getToken();
  return await apiPatch<ISignInMethod>(`account/security/methods/${uuid}`, { name }, token);
};

export const removeSignInMethod = async (uuid: string, password: string) => {
  const token = await getToken();
  return await apiPost<{ removed: boolean }>(`account/security/methods/${uuid}/remove`, { password }, token);
};

export const makeNewBackupCodes = async (password: string) => {
  const token = await getToken();
  return await apiPost<{ backup_codes: string[] }>(`account/security/backup-codes`, { password }, token);
};
