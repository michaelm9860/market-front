import { LoginRequest } from "../@types/LoginRequest";
import { authUrl } from "./base-urls";

const baseUrl = authUrl;

async function register(formData: FormData) {
  try {
    const response = await fetch(`${baseUrl}/register`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    const json = await response.json();
    return json;
  } catch (error) {
    throw error;
  }
}

async function login(body: LoginRequest) {
  const res = await fetch(`${baseUrl}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(JSON.stringify(json));
  }
  return json;
}

export const Auth = { register, login };
