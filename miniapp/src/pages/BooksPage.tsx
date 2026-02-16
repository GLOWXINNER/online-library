import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { BookListItem } from "../types/book";
import { listBooksApi } from "../api/books";
import { addFavoriteApi, removeFavoriteApi } from "../api/favorites";
import { useAuth } from "../app/providers/AuthProvider";
import { useToast } from "../app/providers/ToastProvider";
import { Card, CardHeader, CardPad } from "../ui/Card";
import { Button } from "../ui/Button";
import { InputField } from "../ui/Input";
import { Alert } from "../ui/Alert";
import { Spinner } from "../ui/Spinner";
import { EmptyState } from "../ui/EmptyState";
import styles from "./pages.module.css";

export function BooksPage() {
  const toast = useToast();
  const { token, isAuthed } = useAuth();

  const [items, setItems] = useState<BookListItem[]>([]);
  const [query, setQuery] = useState("");
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((b) => {
      const hay = [b.title, String(b.year), b.authors.join(", "), b.genres.join(", ")].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  const onFav = async (id: number) => {
    if (!token) return;
    try {
      await addFavoriteApi(token, id);
      toast.success("Добавлено в избранное");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  };

  const onUnfav = async (id: number) => {
    if (!token) return;
    try {
      await removeFavoriteApi(token, id);
      toast.info("Удалено из избранного");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  };

  return (
    <div className={styles.grid}>
      <h1 className={styles.h1}>Books</h1>

      <Card>
        <CardPad>
          <CardHeader
            title="Каталог"
            subtitle="Публичный доступ: список и детали книг"
            right={
              <div className={styles.actions}>
                <Button variant="ghost" onClick={load} size="sm">
                  Reload
                </Button>
              </div>
            }
          />

          <div className={styles.grid}>
            <InputField
              label="Search"
              placeholder="Title / author / genre / year"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            {loading && <Spinner label="Loading books..." />}
            {err && <Alert type="error">{err}</Alert>}

            {!loading && !err && filtered.length === 0 && (
              <EmptyState title="Ничего не найдено" text="Попробуй изменить запрос поиска." />
            )}

            <div className={styles.list}>
              {filtered.map((b) => (
                <Card key={b.id}>
                  <CardPad>
                    <CardHeader
                      title={b.title}
                      subtitle={`${b.year} · Authors: ${b.authors.join(", ")} · Genres: ${b.genres.join(", ")}`}
                      right={
                        isAuthed ? (
                          <div className={styles.actions}>
                            <Button size="sm" onClick={() => onFav(b.id)}>
                              + Fav
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => onUnfav(b.id)}>
                              - Fav
                            </Button>
                          </div>
                        ) : (
                          <span className={styles.muted}>Login to use favorites</span>
                        )
                      }
                    />

                    <div className={styles.actions}>
                      <Link className={styles.linkBtn} to={`/books/${b.id}`}>
                        Open details
                      </Link>
                    </div>
                  </CardPad>
                </Card>
              ))}
            </div>
          </div>
        </CardPad>
      </Card>
    </div>
  );
}
