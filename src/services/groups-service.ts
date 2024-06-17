import { groupsUrl } from "./base-urls";

const baseUrl = groupsUrl;

const getGroupById = async (id: number) => {
  const token = localStorage.getItem("token") ?? "";
  if (!token) {
    throw new Error("Must be logged in to view groups");
  }

  const res = await fetch(`${baseUrl}/${id}`, {
    method: "GET",
    headers: {
      Authorization: `bearer ${token}`,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(JSON.stringify(json));
  }

  return json;
};

const createGroup = async (data: FormData) => {
  const token = localStorage.getItem("token") ?? "";
  if (!token) {
    throw new Error("Must be logged in to create groups");
  }

  const res = await fetch(baseUrl, {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
    },
    body: data,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(JSON.stringify(json));
  }

  return json;
};

const updateGroupById = async (id: number, data: FormData) => {
  const token = localStorage.getItem("token") ?? "";
  if (!token) {
    throw new Error("Must be logged in to update groups");
  }

  const res = await fetch(`${baseUrl}/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `bearer ${token}`,
    },
    body: data,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(JSON.stringify(json));
  }

  return json;
};

const deleteGroupById = async (id: number) => {
  const token = localStorage.getItem("token") ?? "";
  if (!token) {
    throw new Error("Must be logged in to delete groups");
  }

  const res = await fetch(`${baseUrl}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `bearer ${token}`,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(JSON.stringify(json));
  }

  return json;
};

const approveGroupJoinRequest = async (groupId: number, userId: number) => {
  const token = localStorage.getItem("token") ?? "";
  if (!token) {
    throw new Error("Must be logged in to approve group join requests");
  }

  const res = await fetch(`${baseUrl}/${groupId}/users/${userId}/approve`, {
    method: "PUT",
    headers: {
      Authorization: `bearer ${token}`,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(JSON.stringify(json));
  }

  return json;
};

const rejectGroupJoinRequest = async (groupId: number, userId: number) => {
  const token = localStorage.getItem("token") ?? "";
  if (!token) {
    throw new Error("Must be logged in to reject group join requests");
  }

  const res = await fetch(`${baseUrl}/${groupId}/users/${userId}/reject`, {
    method: "PUT",
    headers: {
      Authorization: `bearer ${token}`,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(JSON.stringify(json));
  }

  return json;
};

const promoteUserToGroupAdmin = async (groupId: number, userId: number) => {
  const token = localStorage.getItem("token") ?? "";
  if (!token) {
    throw new Error("Must be logged in to promote users");
  }

  const res = await fetch(`${baseUrl}/${groupId}/users/${userId}/promote`, {
    method: "PUT",
    headers: {
      Authorization: `bearer ${token}`,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(JSON.stringify(json));
  }

  return json;
};

const addOrRemoveUserFromGroup = async (groupId: number, userId: number) => {
  const token = localStorage.getItem("token") ?? "";
  if (!token) {
    throw new Error("Must be logged in to add/remove users");
  }

  const res = await fetch(`${baseUrl}/${groupId}/users/${userId}`, {
    method: "PUT",
    headers: {
      Authorization: `bearer ${token}`,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(JSON.stringify(json));
  }

  return json;
};

const getAllGroups = async (
  pageNum?: number,
  pageSize?: number,
  sortDir?: string,
  sortBy?: number[]
) => {
  const token = localStorage.getItem("token") ?? "";
  if (!token) {
    throw new Error("Must be logged in to view groups");
  }

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
    headers: {
      Authorization: `bearer ${token}`,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(JSON.stringify(json));
  }

  return json;
};

export const GroupsService = {
  getGroupById,
  createGroup,
  updateGroupById,
  deleteGroupById,
  approveGroupJoinRequest,
  rejectGroupJoinRequest,
  promoteUserToGroupAdmin,
  addOrRemoveUserFromGroup,
  getAllGroups
};
