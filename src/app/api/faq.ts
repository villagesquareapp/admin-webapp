"use server";

import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import { getToken } from "@/lib/getToken";
import { revalidateCurrentPath } from "@/lib/revalidate";

const done = async <T extends { status: boolean }>(r: T) => {
  if (r?.status) await revalidateCurrentPath();
  return r;
};

export const getFaqs = async () => {
  const token = await getToken();
  return await apiGet<IFaqList>(`faqs`, token);
};

export const addFaqCategory = async (name: string) => {
  const token = await getToken();
  return done(await apiPost(`faqs/categories`, { name }, token));
};

export const renameFaqCategory = async (id: number, name: string) => {
  const token = await getToken();
  return done(await apiPatch(`faqs/categories/${id}`, { name }, token));
};

export const deleteFaqCategory = async (id: number) => {
  const token = await getToken();
  if (!token) return null;
  return done(await apiDelete(`faqs/categories/${id}`, token));
};

export const addFaq = async (payload: { category_id: number; question: string; answer: string }) => {
  const token = await getToken();
  return done(await apiPost(`faqs`, payload, token));
};

export const updateFaq = async (id: number, payload: { category_id?: number; question?: string; answer?: string }) => {
  const token = await getToken();
  return done(await apiPatch(`faqs/${id}`, payload, token));
};

export const deleteFaq = async (id: number) => {
  const token = await getToken();
  if (!token) return null;
  return done(await apiDelete(`faqs/${id}`, token));
};
