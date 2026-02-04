import { apiFetch } from "./client";
import type { AuthLoginRequest, AuthRegisterRequest, TokenResponse } from "../types/auth";
import type { UserMe } from "../types/user";

export function loginApi(payload: AuthLoginRequest): Promise<TokenResponse> {
  return apiFetch<TokenResponse>("/auth/login", { method: "POST", body: JSON.stringify(payload) });
}

export function registerApi(payload: AuthRegisterRequest): Promise<UserMe> {
  return apiFetch<UserMe>("/auth/register", { method: "POST", body: JSON.stringify(payload) });
}

export function meApi(token: string): Promise<UserMe> {
  return apiFetch<UserMe>("/auth/me", { method: "GET", token });
}
