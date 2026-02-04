import { useEffect, useState } from "react";
import type { BookListItem } from "../types/book";
import { listBooksApi } from "../api/books";
import { Link } from "react-router-dom";
import { useAuth } from "../app/providers/AuthProvider";
import { addFavoriteApi, removeFavoriteApi } from "../api/favorites";

export function BooksPage() {
  const { token, isAuthed } = useAuth();
  const [items, setItems] = useState<BookListItem[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setErr(null);
    setLoading(true);
    try {
      const data = await listBooksApi();
      setItems(data);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onFav = async (id: number) => {
    if (!token) return;
    try {
      await addFavoriteApi(token, id);
      alert("Added to favorites");
    } catch (e: any) {
      alert(e?.message ?? "Failed");
    }
  };

  const onUnfav = async (id: number) => {
    if (!token) return;
    try {
      await removeFavoriteApi(token, id);
      alert("Removed from favorites");
    } catch (e: any) {
      alert(e?.message ?? "Failed");
    }
  };

  return (
    <div>
      <h2>Books</h2>
      <button onClick={load} disabled={loading}>{loading ? "..." : "Reload"}</button>
      {err && <div style={{ color: "crimson", marginTop: 10 }}>{err}</div>}
      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        {items.map((b) => (
          <div key={b.id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <Link to={`/books/${b.id}`} style={{ fontWeight: 700 }}>{b.title}</Link>
                <div style={{ opacity: 0.8 }}>{b.year}</div>
                <div style={{ opacity: 0.8 }}>Authors: {b.authors.join(", ")}</div>
                <div style={{ opacity: 0.8 }}>Genres: {b.genres.join(", ")}</div>
              </div>
              {isAuthed && (
                <div style={{ display: "grid", gap: 8 }}>
                  <button onClick={() => onFav(b.id)}>+ Favorite</button>
                  <button onClick={() => onUnfav(b.id)}>- Favorite</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
