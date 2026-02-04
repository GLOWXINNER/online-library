import { apiFetch } from "./client";
import type { BookCreateRequest, BookDetail, BookListItem } from "../types/book";

export function listBooksApi(): Promise<BookListItem[]> {
  return apiFetch<BookListItem[]>("/books", { method: "GET" });
}

export function getBookApi(id: number): Promise<BookDetail> {
  return apiFetch<BookDetail>(`/books/${id}`, { method: "GET" });
}

export function createBookApi(token: string, payload: BookCreateRequest): Promise<BookDetail> {
  return apiFetch<BookDetail>("/books", { method: "POST", token, body: JSON.stringify(payload) });
}

export function deleteBookApi(token: string, id: number): Promise<void> {
  return apiFetch<void>(`/books/${id}`, { method: "DELETE", token });
}
