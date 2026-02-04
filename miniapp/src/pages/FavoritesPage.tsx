import { useEffect, useState } from "react";
import { useAuth } from "../app/providers/AuthProvider";
import type { BookListItem } from "../types/book";
import { listFavoritesApi, removeFavoriteApi } from "../api/favorites";
import { Link } from "react-router-dom";

export function FavoritesPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<BookListItem[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    if (!token) return;
    setErr(null);
    try {
      const data = await listFavoritesApi(token);
      setItems(data);
    } catch (e: any) {
      setErr(e?.message ?? "Failed");
    }
  };

  useEffect(() => {
    void load();
  }, [token]);

  const onRemove = async (id: number) => {
    if (!token) return;
    await removeFavoriteApi(token, id);
    await load();
  };

  return (
    <div>
      <h2>Favorites</h2>
      <button onClick={load}>Reload</button>
      {err && <div style={{ color: "crimson", marginTop: 10 }}>{err}</div>}
      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        {items.map((b) => (
          <div key={b.id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <Link to={`/books/${b.id}`} style={{ fontWeight: 700 }}>{b.title}</Link>
                <div style={{ opacity: 0.8 }}>{b.year}</div>
              </div>
              <button onClick={() => onRemove(b.id)}>Remove</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div style={{ opacity: 0.8 }}>No favorites yet.</div>}
      </div>
    </div>
  );
}
