import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { BookDetail } from "../types/book";
import { getBookApi } from "../api/books";
import { useAuth } from "../app/providers/AuthProvider";
import { addFavoriteApi, removeFavoriteApi } from "../api/favorites";

export function BookDetailsPage() {
  const { id } = useParams();
  const bookId = Number(id);
  const { token, isAuthed } = useAuth();

  const [data, setData] = useState<BookDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setErr(null);
      try {
        const d = await getBookApi(bookId);
        setData(d);
      } catch (e: any) {
        setErr(e?.message ?? "Failed");
      }
    })();
  }, [bookId]);

  const onFav = async () => {
    if (!token) return;
    await addFavoriteApi(token, bookId);
    alert("Added to favorites");
  };

  const onUnfav = async () => {
    if (!token) return;
    await removeFavoriteApi(token, bookId);
    alert("Removed from favorites");
  };

  if (err) return <div style={{ color: "crimson" }}>{err}</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h2>{data.title}</h2>
      <div style={{ opacity: 0.8 }}>Year: {data.year}</div>
      {data.isbn && <div style={{ opacity: 0.8 }}>ISBN: {data.isbn}</div>}
      {data.description && <p>{data.description}</p>}
      <div style={{ opacity: 0.8 }}>Authors: {data.authors.join(", ")}</div>
      <div style={{ opacity: 0.8 }}>Genres: {data.genres.join(", ")}</div>

      {isAuthed && (
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button onClick={onFav}>+ Favorite</button>
          <button onClick={onUnfav}>- Favorite</button>
        </div>
      )}
    </div>
  );
}
