import type { JWT } from "next-auth/jwt";

// Server-only helpers for the API token kept inside next-auth's encrypted
// cookie. The browser never sees it.
const API_URL = (process.env.API_URL || "").replace(/\/+$/, "");
const RENEW_EARLY_MS = 60_000;

export const tokenIsFresh = (token: JWT) =>
  !!token.accessToken && Date.now() < (token.accessTokenExpires ?? 0) - RENEW_EARLY_MS;

export async function renewAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refresh_token: token.refreshToken }),
      cache: "no-store",
    });
    const json = await response.json().catch(() => null);
    // 503 means the API couldn't check the session; keep it and retry later.
    if (response.status === 503) return token;
    if (!response.ok || !json?.data?.access_token) return { ...token, error: "SessionEnded" };
    const data = json.data;
    return {
      ...token,
      accessToken: data.access_token,
      accessTokenExpires: Date.now() + data.expires_in * 1000,
      user: { ...token.user, role: data.user?.role, permissions: data.user?.permissions },
      error: undefined,
    };
  } catch {
    return token;
  }
}

export async function endApiSession(token: JWT) {
  if (!token?.accessToken) return;
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token.accessToken}` },
    cache: "no-store",
  }).catch(() => undefined);
}
