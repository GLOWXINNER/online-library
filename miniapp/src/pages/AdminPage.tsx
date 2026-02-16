import { useEffect, useState } from "react";
import type { BookCreateRequest, BookListItem } from "../types/book";
import { listBooksApi, createBookApi, deleteBookApi } from "../api/books";
import { exportBooksCsvApi } from "../api/admin";
import { useAuth } from "../app/providers/AuthProvider";
import { useToast } from "../app/providers/ToastProvider";
import { Card, CardHeader, CardPad } from "../ui/Card";
import { Button } from "../ui/Button";
import { InputField, TextAreaField } from "../ui/Input";
import { Alert } from "../ui/Alert";
import { Spinner } from "../ui/Spinner";
import styles from "./pages.module.css";

function splitCsvLike(s: string): string[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export function AdminPage() {
  const { token } = useAuth();
  const toast = useToast();

  const [books, setBooks] = useState<BookListItem[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // form
  const [title, setTitle] = useState("");
  const [year, setYear] = useState<number>(2024);
  const [isbn, setIsbn] = useState("");
  const [description, setDescription] = useState("");
  const [authors, setAuthors] = useState("Author 1, Author 2");
  const [genres, setGenres] = useState("Genre 1, Genre 2");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setErr(null);
    setLoading(true);
    try {
      const data = await listBooksApi();
      setBooks(data);
    } catch (e: any) {
      setErr(e?.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onCreate = async () => {
    if (!token) return;
    setErr(null);
    setBusy(true);
    try {
      const payload: BookCreateRequest = {
        title: title.trim(),
        year: Number(year),
        isbn: isbn.trim() || null,
        description: description.trim() || null,
        authors: splitCsvLike(authors),
        genres: splitCsvLike(genres),
      };

      await createBookApi(token, payload);
      toast.success("Книга добавлена", "Admin");

      setTitle("");
      setIsbn("");
      setDescription("");
      await load();
    } catch (e: any) {
      setErr(e?.message ?? "Create failed");
      toast.error(e?.message ?? "Create failed", "Admin");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id: number) => {
    if (!token) return;
    setBusy(true);
    try {
      await deleteBookApi(token, id);
      toast.info("Удалено");
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  const onExport = async () => {
    if (!token) return;
    setBusy(true);
    try {
      const blob = await exportBooksCsvApi(token);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "books.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV скачан", "Admin");
    } catch (e: any) {
      toast.error(e?.message ?? "Export failed", "Admin");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.grid}>
      <h1 className={styles.h1}>Admin</h1>

      <div className={styles.two}>
        <Card>
          <CardPad>
            <CardHeader
              title="Create book"
              subtitle="Add / Delete / Export CSV"
              right={
                <div className={styles.actions}>
                  <Button size="sm" variant="ghost" onClick={load} disabled={busy}>
                    Reload
                  </Button>
                  <Button size="sm" onClick={onExport} disabled={busy}>
                    Export CSV
                  </Button>
                </div>
              }
            />

            <div className={styles.grid}>
              {err && <Alert type="error">{err}</Alert>}

              <InputField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <InputField
                label="Year"
                type="number"
                value={String(year)}
                onChange={(e) => setYear(Number(e.target.value))}
              />
              <InputField label="ISBN (optional)" value={isbn} onChange={(e) => setIsbn(e.target.value)} />
              <TextAreaField
                label="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <InputField
                label="Authors (comma separated)"
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
              />
              <InputField
                label="Genres (comma separated)"
                value={genres}
                onChange={(e) => setGenres(e.target.value)}
              />

              <div className={styles.actions}>
                <Button onClick={onCreate} disabled={busy || !title.trim()}>
                  {busy ? "..." : "Add book"}
                </Button>
                <span className={styles.muted}>
                  Если backend ждёт IDs авторов/жанров — поменяй DTO и форму.
                </span>
              </div>
            </div>
          </CardPad>
        </Card>

        <Card>
          <CardPad>
            <CardHeader title="Books" subtitle="Delete existing books" />
            {loading ? (
              <Spinner label="Loading..." />
            ) : (
              <div className={styles.list}>
                {books.map((b) => (
                  <Card key={b.id}>
                    <CardPad>
                      <CardHeader
                        title={`${b.title}`}
                        subtitle={`${b.year} · ${b.authors.join(", ")}`}
                        right={
                          <Button size="sm" variant="danger" onClick={() => onDelete(b.id)} disabled={busy}>
                            Delete
                          </Button>
                        }
                      />
                    </CardPad>
                  </Card>
                ))}
              </div>
            )}
          </CardPad>
        </Card>
      </div>
    </div>
  );
}
