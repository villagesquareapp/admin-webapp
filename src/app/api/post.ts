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

export const getPosts = async (page: number = 1, limit: number = 20) => {
    console.log("PAGE I GOT", page);
    console.log("LIMIT I GOT", limit);
    const token = await getToken()
    return await apiGet<IPostResponse>(
        `posts?page=${page}&limit=${limit}`,
        token
    );
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