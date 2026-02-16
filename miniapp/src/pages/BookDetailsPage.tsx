import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { BookDetail } from "../types/book";
import { getBookApi } from "../api/books";
import { addFavoriteApi, removeFavoriteApi } from "../api/favorites";
import { useAuth } from "../app/providers/AuthProvider";
import { useToast } from "../app/providers/ToastProvider";
import { Card, CardHeader, CardPad } from "../ui/Card";
import { Button } from "../ui/Button";
import { Alert } from "../ui/Alert";
import { Spinner } from "../ui/Spinner";
import styles from "./pages.module.css";

export function BookDetailsPage() {
  const { id } = useParams();
  const bookId = Number(id);
  const toast = useToast();
  const { token, isAuthed } = useAuth();

  const [data, setData] = useState<BookDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setErr(null);
      setLoading(true);
      try {
        const d = await getBookApi(bookId);
        setData(d);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [bookId]);

  const onFav = async () => {
    if (!token) return;
    try {
      await addFavoriteApi(token, bookId);
      toast.success("Добавлено в избранное");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  };

  const onUnfav = async () => {
    if (!token) return;
    try {
      await removeFavoriteApi(token, bookId);
      toast.info("Удалено из избранного");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  };

  return (
    <div className={styles.grid}>
      <h1 className={styles.h1}>Book details</h1>

      <Card>
        <CardPad>
          {loading && <Spinner label="Loading book..." />}
          {err && <Alert type="error">{err}</Alert>}

          {!loading && !err && data && (
            <>
              <CardHeader
                title={data.title}
                subtitle={`${data.year}${data.isbn ? ` · ISBN: ${data.isbn}` : ""}`}
                right={
                  isAuthed ? (
                    <div className={styles.actions}>
                      <Button size="sm" onClick={onFav}>
                        + Fav
                      </Button>
                      <Button size="sm" variant="ghost" onClick={onUnfav}>
                        - Fav
                      </Button>
                    </div>
                  ) : (
                    <span className={styles.muted}>Login to use favorites</span>
                  )
                }
              />

              {data.description && <div className={styles.kv}>{data.description}</div>}

              <div className={styles.kv}>
                <div><b>Authors:</b> {data.authors.join(", ")}</div>
                <div><b>Genres:</b> {data.genres.join(", ")}</div>
              </div>
            </>
          )}
        </CardPad>
      </Card>
    </div>
  );
}
