import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { BookListItem } from "../types/book";
import { listFavoritesApi, removeFavoriteApi } from "../api/favorites";
import { useAuth } from "../app/providers/AuthProvider";
import { useToast } from "../app/providers/ToastProvider";
import { Card, CardHeader, CardPad } from "../ui/Card";
import { Button } from "../ui/Button";
import { Alert } from "../ui/Alert";
import { Spinner } from "../ui/Spinner";
import { EmptyState } from "../ui/EmptyState";
import styles from "./pages.module.css";

export function FavoritesPage() {
  const { token } = useAuth();
  const toast = useToast();

  const [items, setItems] = useState<BookListItem[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!token) return;
    setErr(null);
    setLoading(true);
    try {
      const data = await listFavoritesApi(token);
      setItems(data);
    } catch (e: any) {
      setErr(e?.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [token]);

  const onRemove = async (id: number) => {
    if (!token) return;
    try {
      await removeFavoriteApi(token, id);
      toast.info("Удалено из избранного");
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  };

  return (
    <div className={styles.grid}>
      <h1 className={styles.h1}>Favorites</h1>

      <Card>
        <CardPad>
          <CardHeader
            title="Избранное"
            subtitle="Доступно только после логина"
            right={
              <div className={styles.actions}>
                <Button size="sm" variant="ghost" onClick={load}>
                  Reload
                </Button>
              </div>
            }
          />

          {loading && <Spinner label="Loading favorites..." />}
          {err && <Alert type="error">{err}</Alert>}

          {!loading && !err && items.length === 0 && (
            <EmptyState title="Пока пусто" text="Добавь книги в избранное со страницы Books." />
          )}

          <div className={styles.list}>
            {items.map((b) => (
              <Card key={b.id}>
                <CardPad>
                  <CardHeader
                    title={b.title}
                    subtitle={`${b.year} · ${b.authors.join(", ")}`}
                    right={
                      <Button size="sm" variant="danger" onClick={() => onRemove(b.id)}>
                        Remove
                      </Button>
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
        </CardPad>
      </Card>
    </div>
  );
}
