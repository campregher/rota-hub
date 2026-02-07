export type Job = {
  id: string;
  status: string;
  notes?: string | null;
  pickupAddress?: { street: string; city: string } | null;
  dropoffAddress?: { street: string; city: string } | null;
};

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

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

export async function getCourierFeed(): Promise<Job[]> {
  const res = await fetch(`${API_URL}/courier/feed`);
  if (!res.ok) {
    throw await buildHttpError(res, `Feed failed at ${API_URL}/courier/feed`);
  }
  return res.json();
}

export async function getJobs(): Promise<Job[]> {
  const res = await fetch(`${API_URL}/jobs`);
  if (!res.ok) {
    throw await buildHttpError(res, `Jobs failed at ${API_URL}/jobs`);
  }
  return res.json();
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

  const res = await fetch(`${API_URL}/jobs/${args.jobId}/pod`, {
    method: "POST",
    body: formData
  });
  if (!res.ok) {
    throw await buildHttpError(res, `POD upload failed at ${API_URL}`);
  }
  return res.json();
}
