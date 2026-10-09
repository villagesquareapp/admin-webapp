"use server";

import { apiGet, apiPatch, apiPost } from "@/lib/api";
import { baseApiCall } from "@/lib/api/base";
import { getToken } from "@/lib/getToken";
import { revalidateCurrentPath } from "@/lib/revalidate";

const query = (params: Record<string, string | number | undefined | null>) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  });
  return q.toString();
};

const mutated = async <T extends { status: boolean }>(response: T) => {
  if (response?.status) await revalidateCurrentPath();
  return response;
};

// Types
export const getTrybeTypes = async () => {
  const token = await getToken();
  return apiGet<ITrybeType[]>("trybes/types", token);
};

export const createTrybeType = async (body: Partial<ITrybeType>) => {
  const token = await getToken();
  return mutated(await apiPost<ITrybeType>("trybes/types", body, token));
};

export const updateTrybeType = async (uuid: string, body: Partial<ITrybeType>) => {
  const token = await getToken();
  return mutated(await apiPatch<ITrybeType>(`trybes/types/${encodeURIComponent(uuid)}`, body, token));
};

// Trybes
export const getTrybes = async (
  page = 1,
  limit = 10,
  filters: { status?: string; type_id?: string; search?: string; linked?: string; institution_id?: string } = {}
) => {
  const token = await getToken();
  return apiGet<IPaginatedResponse<ITrybeListItem>>(`trybes?${query({ page, limit, ...filters })}`, token);
};

export const getTrybe = async (uuid: string) => {
  const token = await getToken();
  return apiGet<ITrybeDetail>(`trybes/${encodeURIComponent(uuid)}`, token);
};

export const createTrybe = async (body: Record<string, unknown>) => {
  const token = await getToken();
  return mutated(await apiPost<ITrybeDetail>("trybes", body, token));
};

export const updateTrybe = async (uuid: string, body: Record<string, unknown>) => {
  const token = await getToken();
  return mutated(await apiPatch<ITrybeDetail>(`trybes/${encodeURIComponent(uuid)}`, body, token));
};

// suspend (from active), activate (lifts a suspension), archive, restore
// (from the archive).
export const setTrybeStatus = async (
  uuid: string,
  action: "suspend" | "activate" | "archive" | "restore",
  reason?: string
) => {
  const token = await getToken();
  return mutated(
    await apiPost<ITrybeDetail>(`trybes/${encodeURIComponent(uuid)}/${action}`, reason ? { reason } : {}, token)
  );
};

// The form carries one "image" file.
export const uploadTrybeImage = async (uuid: string, kind: "avatar" | "cover", form: FormData) => {
  const token = await getToken();
  return mutated(
    await baseApiCall<ITrybeDetail>(
      "POST",
      `trybes/${encodeURIComponent(uuid)}/images?kind=${kind}`,
      { body: form, isFormData: true },
      token
    )
  );
};

// People
export const getTrybeMembers = async (
  uuid: string,
  page = 1,
  limit = 10,
  filters: { role?: string; status?: string; search?: string } = {}
) => {
  const token = await getToken();
  return apiGet<IPaginatedResponse<ITrybeMember>>(
    `trybes/${encodeURIComponent(uuid)}/members?${query({ page, limit, ...filters })}`,
    token
  );
};

export const assignTrybeRole = async (
  uuid: string,
  body: { username?: string; user_id?: string; role: string; intro?: string }
) => {
  const token = await getToken();
  return mutated(await apiPost(`trybes/${encodeURIComponent(uuid)}/members`, body, token));
};

export const changeTrybeMember = async (
  uuid: string,
  userId: string,
  action: "remove" | "ban" | "unban",
  reason?: string
) => {
  const token = await getToken();
  return mutated(
    await apiPost(
      `trybes/${encodeURIComponent(uuid)}/members/${encodeURIComponent(userId)}/${action}`,
      reason ? { reason } : {},
      token
    )
  );
};

export const getTrybeMember = async (uuid: string, userId: string) => {
  const token = await getToken();
  return apiGet<ITrybeMemberDetail>(
    `trybes/${encodeURIComponent(uuid)}/members/${encodeURIComponent(userId)}`,
    token
  );
};

// The only way to change who owns a Trybe; the current owner stays on as
// previous_owner_role.
export const transferTrybeOwner = async (
  uuid: string,
  body: { username?: string; user_id?: string; previous_owner_role?: string; reason?: string }
) => {
  const token = await getToken();
  return mutated(
    await apiPost<{ owner: string; previous_owner: string | null; previous_owner_role: string | null }>(
      `trybes/${encodeURIComponent(uuid)}/owner`,
      body,
      token
    )
  );
};

export const setTrybeIntro = async (uuid: string, userId: string, intro: string) => {
  const token = await getToken();
  return mutated(
    await apiPatch(`trybes/${encodeURIComponent(uuid)}/members/${encodeURIComponent(userId)}/intro`, { intro }, token)
  );
};

// The Highlights announcement: the form carries title, body and an optional "image".
export const setTrybeFeatured = async (uuid: string, form: FormData) => {
  const token = await getToken();
  return mutated(
    // push is there when notify was sent: who got it, or why it didn't go.
    await baseApiCall<ITrybeDetail & { push?: { recipients: number; sent_at: string } | { error: string } }>(
      "PUT",
      `trybes/${encodeURIComponent(uuid)}/featured`,
      { body: form, isFormData: true },
      token
    )
  );
};

export const clearTrybeFeatured = async (uuid: string, reason?: string) => {
  const token = await getToken();
  return mutated(
    await baseApiCall<ITrybeDetail>(
      "DELETE",
      `trybes/${encodeURIComponent(uuid)}/featured`,
      { body: JSON.stringify(reason ? { reason } : {}) },
      token
    )
  );
};

// A Trybe's events, files and polls
export const getTrybeEvents = async (
  uuid: string,
  page = 1,
  limit = 10,
  filters: { status?: string; search?: string } = {}
) => {
  const token = await getToken();
  return apiGet<IPaginatedResponse<ITrybeEvent>>(
    `trybes/${encodeURIComponent(uuid)}/events?${query({ page, limit, ...filters })}`,
    token
  );
};

export const getTrybeFiles = async (
  uuid: string,
  page = 1,
  limit = 10,
  filters: { kind?: string; search?: string; status?: string } = {}
) => {
  const token = await getToken();
  return apiGet<IPaginatedResponse<ITrybeFile>>(
    `trybes/${encodeURIComponent(uuid)}/files?${query({ page, limit, ...filters })}`,
    token
  );
};

export const getTrybePolls = async (uuid: string, page = 1, limit = 10, status?: string) => {
  const token = await getToken();
  return apiGet<IPaginatedResponse<ITrybePoll>>(
    `trybes/${encodeURIComponent(uuid)}/polls?${query({ page, limit, status })}`,
    token
  );
};

// event → cancel; file and poll → remove.
export const takeDownTrybeContent = async (
  uuid: string,
  kind: "events" | "files" | "polls",
  id: string,
  reason?: string
) => {
  const token = await getToken();
  const action = kind === "events" ? "cancel" : "remove";
  return mutated(
    await apiPost(
      `trybes/${encodeURIComponent(uuid)}/${kind}/${encodeURIComponent(id)}/${action}`,
      reason ? { reason } : {},
      token
    )
  );
};

// Join requests
export const getJoinRequests = async (
  page = 1,
  limit = 10,
  filters: { status?: string; trybe_id?: string; search?: string } = {}
) => {
  const token = await getToken();
  return apiGet<IPaginatedResponse<ITrybeJoinRequest>>(
    `trybes/join-requests?${query({ page, limit, ...filters })}`,
    token
  );
};

export const getJoinRequest = async (uuid: string) => {
  const token = await getToken();
  return apiGet<ITrybeJoinRequestDetail>(`trybes/join-requests/${encodeURIComponent(uuid)}`, token);
};

// Fetched only when a reviewer opens the photos; links last 5 minutes and
// every call is logged against the reviewer.
export const getJoinRequestDocuments = async (uuid: string) => {
  const token = await getToken();
  return baseApiCall<ITrybeDocumentLinks>(
    "GET",
    `trybes/join-requests/${encodeURIComponent(uuid)}/documents`,
    { cache: "no-store" },
    token
  );
};

export const approveJoinRequest = async (uuid: string) => {
  const token = await getToken();
  return mutated(await apiPost(`trybes/join-requests/${encodeURIComponent(uuid)}/approve`, {}, token));
};

export const decideJoinRequests = async (uuids: string[], action: "approve" | "reject", reason?: string) => {
  const token = await getToken();
  return mutated(
    await apiPost<{ action: string; done: string[]; failed: { uuid: string; message: string }[] }>(
      "trybes/join-requests/bulk",
      { uuids, action, ...(reason ? { reason } : {}) },
      token
    )
  );
};

export const rejectJoinRequest = async (uuid: string, reason: string) => {
  const token = await getToken();
  return mutated(await apiPost(`trybes/join-requests/${encodeURIComponent(uuid)}/reject`, { reason }, token));
};

// Bring back what staff or the Trybe's admins took down: a cancelled event
// (if it hasn't ended), a removed link, a removed poll; or close a poll now.
export const restoreTrybeContent = async (
  uuid: string,
  kind: "events" | "files" | "polls",
  id: string,
  reason?: string
) => {
  const token = await getToken();
  return mutated(
    await apiPost(
      `trybes/${encodeURIComponent(uuid)}/${kind}/${encodeURIComponent(id)}/restore`,
      reason ? { reason } : {},
      token
    )
  );
};

export const closeTrybePoll = async (uuid: string, pollId: string, reason?: string) => {
  const token = await getToken();
  return mutated(
    await apiPost(
      `trybes/${encodeURIComponent(uuid)}/polls/${encodeURIComponent(pollId)}/close`,
      reason ? { reason } : {},
      token
    )
  );
};

// A Trybe's posts, videos, live sessions or products with their state.
// Take-downs and restores go through executeModeration.
export const getTrybeModerationList = async (
  uuid: string,
  kind: "posts" | "videos" | "live" | "products",
  page = 1,
  limit = 20,
  filters: { state?: string; type?: string; search?: string } = {}
) => {
  const token = await getToken();
  return apiGet<IPaginatedResponse<ITrybeModerationItem>>(
    `trybes/${encodeURIComponent(uuid)}/${kind}?${query({ page, limit, ...filters })}`,
    token
  );
};

// Reports about the Trybe and about content inside it.
export const getTrybeReports = async (uuid: string, page = 1, limit = 20, status?: string) => {
  const token = await getToken();
  return apiGet<IReportResponse>(`reports/service?${query({ page, limit, status, trybe_id: uuid })}`, token);
};

// Overview, audit and pushes to members
export const getTrybesOverview = async () => {
  const token = await getToken();
  return apiGet<ITrybesOverview>("trybes/overview", token);
};

export const getTrybeOverview = async (uuid: string) => {
  const token = await getToken();
  return apiGet<ITrybeOverview>(`trybes/${encodeURIComponent(uuid)}/overview`, token);
};

export const getTrybeAudit = async (
  uuid: string,
  page = 1,
  limit = 20,
  filters: { category?: string; actor?: string } = {}
) => {
  const token = await getToken();
  return apiGet<IPaginatedResponse<ITrybeAuditEntry>>(
    `trybes/${encodeURIComponent(uuid)}/audit?${query({ page, limit, ...filters })}`,
    token
  );
};

export const getTrybeBroadcasts = async (uuid: string) => {
  const token = await getToken();
  return apiGet<ITrybeBroadcasts>(`trybes/${encodeURIComponent(uuid)}/broadcasts`, token);
};

export const sendTrybeBroadcast = async (uuid: string, body: { title: string; body: string }) => {
  const token = await getToken();
  return apiPost<{ recipients: number; sent_at: string }>(`trybes/${encodeURIComponent(uuid)}/broadcast`, body, token);
};
