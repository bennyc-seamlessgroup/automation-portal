// src/services/http/client.ts
import { API_BASE_URL } from "../../config/featureFlag";
import type { ServiceError } from "../../types/scenarios";

function baseHeaders(): HeadersInit {
  return { "Content-Type": "application/json" };
}

export async function http<T>(
  path: string,
  init?: RequestInit & { baseUrl?: string }
): Promise<T> {
  const url = (init?.baseUrl || API_BASE_URL) + path;

  const requestBody = (init as any).body;
  const hasObjectBody =
    init && requestBody && typeof requestBody === "object" && !(requestBody instanceof FormData);

  const res = await fetch(url, {
    method: "GET",
    headers: baseHeaders(),
    ...init,
    body: hasObjectBody ? JSON.stringify((init as any).body) : init?.body,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json().catch(() => undefined) : undefined;

  if (!res.ok) {
    const err: ServiceError = {
      code: (body?.code as ServiceError["code"]) || "UNKNOWN",
      message: body?.message || `HTTP ${res.status}`,
      details: body?.details,
    };
    throw err;
  }
  return body as T;
}
