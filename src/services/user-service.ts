import { User } from "../@types/User";
import { usersUrl } from "./base-urls";

const baseUrl = usersUrl;

const getUserById = async (id: number) => {
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

const updateUser = async (formData: FormData) => {
  const token = localStorage.getItem("token") ?? "";
  const storedUser = localStorage.getItem("user");

  if (!token) {
    throw new Error("Must be logged in to update user details");
  }

  if (!storedUser) {
    throw new Error("No user found in local storage");
  }

  const user = JSON.parse(storedUser);
  const userId = user.id;

  try {
    const res = await fetch(`${baseUrl}/${userId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(JSON.stringify(json));
    }

    return json;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

const deleteUserById = async (id: number) => {
  const token = localStorage.getItem("token") ?? "";
  const storedUser = localStorage.getItem("user");

  if (!token) {
    throw new Error("Must be logged in to delete acount");
  }

  if (!storedUser) {
    throw new Error("No user found in local storage");
  }
  const requestingUser: User = JSON.parse(storedUser);
  if (requestingUser) {
    if (
      requestingUser.id !== Number(id) ||
      requestingUser.roles.some((role) => role.name === "ROLE_ADMIN")
    ) {
      throw new Error("Unauthorized to delete this account");
    }
  } else {
    throw new Error("Must be logged in to delete acount");
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

const refreshLoggedInUser = async (login: Function, logout: Function) => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    const user: User = JSON.parse(storedUser);

    if (user) {
      const updatedUser = await getUserById(user.id);

      const token = localStorage.getItem("token");
      if (token) {
        logout();
        login(token, updatedUser);
      }
    }
  }
};

const exitGroup = async (groupId: number) => {
  const token = localStorage.getItem("token") ?? "";

  if (!token) {
    throw new Error("Must be logged in to exit group");
  }

  const res = await fetch(`${baseUrl}/${groupId}/exitGroup`, {
    method: "PUT",
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

const sendRequestToJoinGroup = async (groupId: number) => {
  const token = localStorage.getItem("token") ?? "";

  if (!token) {
    throw new Error("Must be logged in to join group");
  }

  const res = await fetch(`${baseUrl}/${groupId}/sendJoinRequest`, {
    method: "PUT",
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

export const UserService = {
  getUserById,
  updateUser,
  deleteUserById,
  refreshLoggedInUser,
  exitGroup,
  sendRequestToJoinGroup 
};
