import { ApiError, extractErrorMessage } from "../types/api";

const rawBase = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";
export const API_BASE_URL = rawBase.replace(/\/+$/, "");

type ApiFetchOptions = RequestInit & {
  token?: string | null;
};

export async function apiFetch<T>(path: string, opts: ApiFetchOptions = {}): Promise<T> {
  const urlPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}${urlPath}`;

  const headers = new Headers(opts.headers);
  headers.set("Accept", "application/json");

  if (opts.body && !(opts.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (opts.token) {
    headers.set("Authorization", `Bearer ${opts.token}`);
  }

  const res = await fetch(url, {
    ...opts,
    headers,
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const msg = isJson ? extractErrorMessage(body) : (typeof body === "string" ? body : "Request failed");
    throw new ApiError(res.status, msg, body);
  }

  return body as T;
}
