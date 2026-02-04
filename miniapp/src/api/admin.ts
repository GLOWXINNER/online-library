import { API_BASE_URL } from "./client";

export async function exportBooksCsvApi(token: string): Promise<Blob> {
  const url = `${API_BASE_URL}/admin/books/export.csv`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Export failed");
  return await res.blob();
}
