"use server";

import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/api";
import { baseApiCall } from "@/lib/api/base";
import { getToken } from "@/lib/getToken";
import { revalidateCurrentPath } from "@/lib/revalidate";

// Campus data for Trybes: institutions, the department and level lists, and
// the platform Trybe Code.

const query = (params: Record<string, string | number | boolean | undefined | null>) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  });
  return q.toString();
};

// apiPut and apiDelete need a token; without one the API answers 401.
const requiredToken = async () => (await getToken()) ?? "";

const mutated = async <T extends { status: boolean }>(response: T) => {
  if (response?.status) await revalidateCurrentPath();
  return response;
};

// Institutions
export const getInstitutions = async (
  page = 1,
  limit = 20,
  filters: {
    search?: string;
    kind?: string;
    ownership?: string;
    state?: string;
    linked?: string;
    active?: string;
    sort?: string;
  } = {}
) => {
  const token = await getToken();
  return apiGet<IPaginatedResponse<IInstitution>>(`trybes/institutions?${query({ page, limit, ...filters })}`, token);
};

export const getInstitutionsSummary = async () => {
  const token = await getToken();
  return apiGet<IInstitutionSummary>("trybes/institutions/summary", token);
};

export const getInstitution = async (uuid: string) => {
  const token = await getToken();
  return apiGet<IInstitutionDetail>(`trybes/institutions/${encodeURIComponent(uuid)}`, token);
};

export const createInstitution = async (body: Record<string, unknown>) => {
  const token = await getToken();
  return mutated(await apiPost<IInstitutionDetail>("trybes/institutions", body, token));
};

export const updateInstitution = async (uuid: string, body: Record<string, unknown>) => {
  const token = await getToken();
  return mutated(await apiPatch<IInstitutionDetail>(`trybes/institutions/${encodeURIComponent(uuid)}`, body, token));
};

// The form carries one "image" file.
export const uploadInstitutionLogo = async (uuid: string, form: FormData) => {
  const token = await getToken();
  return mutated(
    await baseApiCall<IInstitutionDetail>(
      "POST",
      `trybes/institutions/${encodeURIComponent(uuid)}/logo`,
      { body: form, isFormData: true },
      token
    )
  );
};

export const createInstitutionTrybe = async (
  uuid: string,
  body: { name?: string; tagline?: string; about?: string }
) => {
  const token = await getToken();
  return mutated(await apiPost<ITrybeDetail>(`trybes/institutions/${encodeURIComponent(uuid)}/trybe`, body, token));
};

// Departments
export const getDepartments = async (
  page = 1,
  limit = 20,
  filters: { search?: string; field?: string; kind?: string; active?: string } = {}
) => {
  const token = await getToken();
  return apiGet<IPaginatedResponse<IDepartment>>(`trybes/departments?${query({ page, limit, ...filters })}`, token);
};

export const getDepartmentFields = async () => {
  const token = await getToken();
  return apiGet<{ field: string | null; total: number }[]>("trybes/departments/fields", token);
};

export const getDepartment = async (uuid: string) => {
  const token = await getToken();
  return apiGet<IDepartmentDetail>(`trybes/departments/${encodeURIComponent(uuid)}`, token);
};

export const getUnmatchedDepartments = async (
  page = 1,
  limit = 20,
  filters: { search?: string; trybe_id?: string; institution_id?: string } = {}
) => {
  const token = await getToken();
  return apiGet<IPaginatedResponse<IUnmatchedDepartment>>(
    `trybes/departments/unmatched?${query({ page, limit, ...filters })}`,
    token
  );
};

export const createDepartment = async (body: Record<string, unknown>) => {
  const token = await getToken();
  return mutated(await apiPost<IDepartmentDetail & { linked_requests: number }>("trybes/departments", body, token));
};

export const addDepartments = async (body: { names: string[]; field?: string; applies_to?: string[] }) => {
  const token = await getToken();
  return mutated(
    await apiPost<{ created: { uuid: string; name: string }[]; skipped: string[]; linked_requests: number }>(
      "trybes/departments/bulk",
      body,
      token
    )
  );
};

export const updateDepartment = async (uuid: string, body: Record<string, unknown>) => {
  const token = await getToken();
  return mutated(
    await apiPatch<IDepartmentDetail & { linked_requests: number }>(
      `trybes/departments/${encodeURIComponent(uuid)}`,
      body,
      token
    )
  );
};

export const addDepartmentAlias = async (uuid: string, alias: string) => {
  const token = await getToken();
  return mutated(
    await apiPost<IDepartmentDetail & { linked_requests: number }>(
      `trybes/departments/${encodeURIComponent(uuid)}/aliases`,
      { alias },
      token
    )
  );
};

// Levels
export const getLevels = async (filters: { kind?: string; active?: string } = {}) => {
  const token = await getToken();
  return apiGet<ILevel[]>(`trybes/levels?${query(filters)}`, token);
};

export const createLevel = async (body: Record<string, unknown>) => {
  const token = await getToken();
  return mutated(await apiPost<ILevel>("trybes/levels", body, token));
};

export const updateLevel = async (uuid: string, body: Record<string, unknown>) => {
  const token = await getToken();
  return mutated(await apiPatch<ILevel>(`trybes/levels/${encodeURIComponent(uuid)}`, body, token));
};

export const reorderLevels = async (uuids: string[]) => {
  const token = await requiredToken();
  return mutated(await apiPut<ILevel[]>("trybes/levels/order", { uuids }, token));
};

// The Trybe Code
export const getTrybeCode = async () => {
  const token = await getToken();
  return apiGet<ITrybeCode>("trybes/code", token);
};

export const setTrybeCode = async (items: ITrybeCodeItem[]) => {
  const token = await requiredToken();
  return mutated(await apiPut<ITrybeCode>("trybes/code", { items }, token));
};

export const resetTrybeCode = async () => {
  const token = await requiredToken();
  return mutated(await apiDelete("trybes/code", token));
};
