import { postsUrl } from "./base-urls";

const baseUrl = postsUrl;

const getPostById = async (id: number) => {
  const token = localStorage.getItem("token") ?? "";

  const headers: HeadersInit = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}/${id}`, {
    method: "GET",
    headers: headers,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(JSON.stringify(json));
  }

  return json;
};

const createPost = async (data: FormData) => {
  const token = localStorage.getItem("token") ?? "";

  const res = await fetch(baseUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: data,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(JSON.stringify(json));
  }

  return json;
};

const deletePostById = async (id: number) => {
  const token = localStorage.getItem("token") ?? "";

  const res = await fetch(`${baseUrl}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(JSON.stringify(json));
  }

  return json;
};

const updatePostById = async (id: number, data: FormData) => {
  const token = localStorage.getItem("token") ?? "";

  const res = await fetch(`${baseUrl}/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: data,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(JSON.stringify(json));
  }

  return json;
};

const createPostInGroup = async (groupId: number, data: FormData) => {
  const token = localStorage.getItem("token") ?? "";

  const res = await fetch(`${baseUrl}/group/${groupId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: data,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(JSON.stringify(json));
  }

  return json;
};

const saveOrUnsavePost = async (postId: number) => {
  const token = localStorage.getItem("token") ?? "";

  const res = await fetch(`${baseUrl}/${postId}/save`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(JSON.stringify(json));
  }

  return json;
};

const getAllPosts = async (
  pageNum?: number,
  pageSize?: number,
  sortDir?: string,
  sortBy?: number[]
) => {

  let url = `${baseUrl}?`;
  if (pageNum) {
    url += `pageNum=${pageNum}&`;
  }
  if (pageSize) {
    url += `pageSize=${pageSize}&`;
  }
  if (sortDir) {
    url += `sortDir=${sortDir}&`;
  }
  if (sortBy) {
    url += `sortBy=${sortBy.join(",")}&`;
  }

  const res = await fetch(url, {
    method: "GET",
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(JSON.stringify(json));
  }

  return json;
};

export const PostsService = {
  getPostById,
  createPost,
  deletePostById,
  updatePostById,
  createPostInGroup,
  saveOrUnsavePost,
  getAllPosts
};
