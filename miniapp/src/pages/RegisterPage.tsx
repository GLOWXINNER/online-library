import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../app/providers/AuthProvider";
import { useToast } from "../app/providers/ToastProvider";
import { Card, CardHeader, CardPad } from "../ui/Card";
import { InputField } from "../ui/Input";
import { Button } from "../ui/Button";
import { Alert } from "../ui/Alert";
import styles from "./pages.module.css";

export function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await register(email.trim(), password);
      toast.success("Аккаунт создан и вы вошли", "Register");
      nav("/books");
    } catch (e: any) {
      setErr(e?.message ?? "Register failed");
      toast.error(e?.message ?? "Register failed", "Register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.grid}>
      <h1 className={styles.h1}>Register</h1>

      <Card>
        <CardPad>
          <CardHeader title="Регистрация" subtitle="После регистрации делаем auto-login" />
          <form className={styles.grid} onSubmit={onSubmit}>
            <InputField
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <InputField
              label="Password"
              hint="Обычно backend требует минимум 8 символов"
              placeholder="min 8 chars"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />

            <div className={styles.actions}>
              <Button disabled={loading || !email.trim() || password.length < 1} type="submit">
                {loading ? "..." : "Create account"}
              </Button>
              <Button variant="ghost" type="button" onClick={() => nav("/login")}>
                I already have account
              </Button>
            </div>

            {err && <Alert type="error">{err}</Alert>}
          </form>
        </CardPad>
      </Card>
    </div>
  );
}
