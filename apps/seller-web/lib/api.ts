import { getAccessToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

type RequestOptions = {
  auth?: boolean;
};

async function parseError(response: Response): Promise<string> {
  try {
    const json = await response.json();
    if (typeof json?.message === "string") {
      return json.message;
    }
    if (Array.isArray(json?.message)) {
      return json.message.join(", ");
    }
    return JSON.stringify(json);
  } catch {
    return response.statusText || "Unknown error";
  }
}

async function apiRequest(
  path: string,
  init: RequestInit,
  options: RequestOptions = {}
) {
  const auth = options.auth ?? true;
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers ?? undefined);
  const body = init.body;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  if (body !== undefined && body !== null && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Not authenticated");
    }
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    method,
    headers,
    cache: "no-store"
  });

  if (!response.ok) {
    const details = await parseError(response);
    throw new Error(`${method} ${path} failed with ${response.status}: ${details}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function apiGet(path: string, options?: RequestOptions) {
  return apiRequest(path, { method: "GET" }, options);
}

export function apiPost(path: string, body?: unknown, options?: RequestOptions) {
  return apiRequest(
    path,
    {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body)
    },
    options
  );
}

export async function login(email: string, password: string): Promise<{
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}> {
  return apiPost("/auth/login", { email, password }, { auth: false });
}
