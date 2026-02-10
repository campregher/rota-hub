import { clearSession, getSession, saveSession, type AuthSession } from "../auth/session";

export type Job = {
  id: string;
  status: string;
  notes?: string | null;
  pickupAddress?: { street: string; city: string } | null;
  dropoffAddress?: { street: string; city: string } | null;
};

export type JobStatus =
  | "OPEN"
  | "ASSIGNED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED"
  | "DISPUTE";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
};

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

const AUTH_EXPIRED_ERROR = "AUTH_EXPIRED";
let refreshInFlight: Promise<AuthSession | null> | null = null;

async function buildHttpError(response: Response, fallback: string): Promise<Error> {
  let details = "";
  try {
    const data = await response.json();
    if (Array.isArray(data?.message)) {
      details = data.message.join(", ");
    } else if (typeof data?.message === "string") {
      details = data.message;
    } else {
      details = JSON.stringify(data);
    }
  } catch {
    try {
      details = await response.text();
    } catch {
      details = "";
    }
  }
  return new Error(`${fallback} (${response.status})${details ? `: ${details}` : ""}`);
}

function getActiveSession(): AuthSession {
  const session = getSession();
  if (!session?.accessToken || !session.refreshToken) {
    throw new Error(AUTH_EXPIRED_ERROR);
  }
  return session;
}

async function refreshSessionIfNeeded(): Promise<AuthSession | null> {
  const current = getSession();
  if (!current?.refreshToken) {
    await clearSession();
    return null;
  }

  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ refreshToken: current.refreshToken })
    });

    if (!response.ok) {
      if (response.status === 400 || response.status === 401) {
        await clearSession();
        return null;
      }
      throw await buildHttpError(response, `Refresh failed at ${API_URL}/auth/refresh`);
    }

    const refreshed = (await response.json()) as AuthTokens;
    await saveSession(refreshed);
    return refreshed;
  })()
    .catch(async (error) => {
      if (error instanceof Error && error.message === AUTH_EXPIRED_ERROR) {
        await clearSession();
        return null;
      }
      throw error;
    })
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

async function requestAuthJson(
  path: string,
  init: RequestInit,
  retryOnUnauthorized = true
): Promise<any> {
  const session = getActiveSession();
  const headers = new Headers(init.headers ?? undefined);
  headers.set("Authorization", `${session.tokenType || "Bearer"} ${session.accessToken}`);

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers
  });

  if (response.status === 401 && retryOnUnauthorized) {
    const refreshed = await refreshSessionIfNeeded();
    if (!refreshed) {
      throw new Error(AUTH_EXPIRED_ERROR);
    }
    return requestAuthJson(path, init, false);
  }

  if (!response.ok) {
    throw await buildHttpError(response, `${init.method ?? "GET"} ${path} failed`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function isAuthExpiredError(error: unknown): boolean {
  return error instanceof Error && error.message === AUTH_EXPIRED_ERROR;
}

export async function login(email: string, password: string): Promise<AuthTokens> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    throw await buildHttpError(res, `Login failed at ${API_URL}/auth/login`);
  }
  return res.json();
}

export async function getCourierFeed(): Promise<Job[]> {
  return requestAuthJson("/courier/feed", { method: "GET" });
}

export async function acceptJob(jobId: string): Promise<Job> {
  return requestAuthJson(`/jobs/${jobId}/accept`, { method: "POST" });
}

export async function updateJobStatus(jobId: string, status: JobStatus): Promise<Job> {
  return requestAuthJson(`/jobs/${jobId}/status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status })
  });
}

export async function uploadPod(args: {
  jobId: string;
  receiverName: string;
  lat?: number;
  lng?: number;
  photoUri?: string;
}) {
  const formData = new FormData();
  formData.append("receiverName", args.receiverName);
  if (args.lat !== undefined) formData.append("lat", String(args.lat));
  if (args.lng !== undefined) formData.append("lng", String(args.lng));

  if (args.photoUri) {
    formData.append("photo", {
      uri: args.photoUri,
      name: "pod.jpg",
      type: "image/jpeg"
    } as any);
  }

  return requestAuthJson(`/jobs/${args.jobId}/pod`, {
    method: "POST",
    body: formData
  });
}
