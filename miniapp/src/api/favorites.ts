import { apiFetch } from "./client";
import type { BookListItem } from "../types/book";

export function listFavoritesApi(token: string): Promise<BookListItem[]> {
  return apiFetch<BookListItem[]>("/users/me/favorites", { method: "GET", token });
}

export function addFavoriteApi(token: string, bookId: number): Promise<void> {
  return apiFetch<void>(`/users/me/favorites/${bookId}`, { method: "POST", token });
}

export function removeFavoriteApi(token: string, bookId: number): Promise<void> {
  return apiFetch<void>(`/users/me/favorites/${bookId}`, { method: "DELETE", token });
}
