import { useEffect, useState } from "react";
import { useAuth } from "../app/providers/AuthProvider";
import { createBookApi, deleteBookApi, listBooksApi } from "../api/books";
import type { BookListItem } from "../types/book";
import { exportBooksCsvApi } from "../api/admin";

export function AdminPage() {
  const { token } = useAuth();
  const [books, setBooks] = useState<BookListItem[]>([]);
  const [title, setTitle] = useState("");
  const [year, setYear] = useState<number>(2020);
  const [description, setDescription] = useState("");
  const [isbn, setIsbn] = useState("");
  const [authors, setAuthors] = useState("Author 1, Author 2");
  const [genres, setGenres] = useState("Genre 1, Genre 2");
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setErr(null);
    try {
      const data = await listBooksApi();
      setBooks(data);
    } catch (e: any) {
      setErr(e?.message ?? "Failed");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onCreate = async () => {
    if (!token) return;
    setErr(null);
    try {
      await createBookApi(token, {
        title,
        year,
        description: description || null,
        isbn: isbn || null,
        authors: authors.split(",").map((s) => s.trim()).filter(Boolean),
        genres: genres.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setTitle("");
      setDescription("");
      setIsbn("");
      await load();
    } catch (e: any) {
      setErr(e?.message ?? "Create failed");
    }
  };

  const onDelete = async (id: number) => {
    if (!token) return;
    await deleteBookApi(token, id);
    await load();
  };

  const onExport = async () => {
    if (!token) return;
    const blob = await exportBooksCsvApi(token);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "books.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2>Admin</h2>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <button onClick={load}>Reload books</button>
        <button onClick={onExport}>Export CSV</button>
      </div>

      {err && <div style={{ color: "crimson", marginBottom: 12 }}>{err}</div>}

      <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12, marginBottom: 18 }}>
        <h3>Create book</h3>
        <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
          <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input placeholder="Year" type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
          <input placeholder="ISBN (optional)" value={isbn} onChange={(e) => setIsbn(e.target.value)} />
          <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <input placeholder="Authors comma separated" value={authors} onChange={(e) => setAuthors(e.target.value)} />
          <input placeholder="Genres comma separated" value={genres} onChange={(e) => setGenres(e.target.value)} />
          <button onClick={onCreate} disabled={!title.trim()}>Create</button>
        </div>
      </div>

      <h3>Books</h3>
      <div style={{ display: "grid", gap: 10 }}>
        {books.map((b) => (
          <div key={b.id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12, display: "flex", justifyContent: "space-between" }}>
            <div>
              <strong>{b.title}</strong> <span style={{ opacity: 0.8 }}>({b.year})</span>
              <div style={{ opacity: 0.8 }}>{b.authors.join(", ")}</div>
            </div>
            <button onClick={() => onDelete(b.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
