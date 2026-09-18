'use server'

import { apiGet, apiPost } from '@/lib/api';
import { getToken } from '@/lib/getToken';
import { revalidateCurrentPath } from '@/lib/revalidate';


export const getPostStats = async () => {
    const token = await getToken()
    return await apiGet<IPostStats>(
        `posts/stats`,
        token
    );
};

export const getPostOverview = async () => {
    const token = await getToken();
    return await apiGet<IPostOverview>(`posts/overview`, token);
};

export const getPostQueue = async (
    page: number = 1,
    limit: number = 20,
    filters: { reason?: string; media_type?: string; search?: string } = {}
) => {
    const token = await getToken();
    const q = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters.reason) q.append("reason", filters.reason);
    if (filters.media_type) q.append("media_type", filters.media_type);
    if (filters.search) q.append("search", filters.search);
    return await apiGet<IPostQueueResponse>(`posts/queue?${q}`, token);
};

export const getPostDetail = async (uuid: string) => {
    const token = await getToken();
    return await apiGet<IPostDetail>(`posts/${uuid}`, token);
};

export const getPosts = async (
    page: number = 1,
    limit: number = 20,
    filters: { status?: string; media_type?: string; search?: string } = {}
) => {
    const token = await getToken();
    const q = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters.status) q.append("status", filters.status);
    if (filters.media_type) q.append("media_type", filters.media_type);
    if (filters.search) q.append("search", filters.search);
    return await apiGet<IPostResponse>(`posts?${q}`, token);
};

export const getSinglePost = async (uuid: string) => {
    const token = await getToken()
    return await apiGet<ISinglePost>(
        `posts/${uuid}`,
        token
    );
};

export const getPostStatus = async () => {
    const token = await getToken();
    return await apiGet<IPostStatusList[]>(`posts/post-status-list`, token);
}

export const updatePostStatus = async (userId: string, status: string) => {
  const token = await getToken();
  const response = await apiPost(
    `posts/${userId}/update-status`,
    { status },
    token
  );

  if (response.status) {
    await revalidateCurrentPath();
  }

  return response;
};