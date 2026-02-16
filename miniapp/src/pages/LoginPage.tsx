import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../app/providers/AuthProvider";
import { useToast } from "../app/providers/ToastProvider";
import { Card, CardHeader, CardPad } from "../ui/Card";
import { InputField } from "../ui/Input";
import { Button } from "../ui/Button";
import { Alert } from "../ui/Alert";
import styles from "./pages.module.css";

export function LoginPage() {
  const { login } = useAuth();
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
      await login(email.trim(), password);
      toast.success("Вы вошли в систему", "Login");
      nav("/books");
    } catch (e: any) {
      setErr(e?.message ?? "Login failed");
      toast.error(e?.message ?? "Login failed", "Login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.grid}>
      <h1 className={styles.h1}>Login</h1>

      <Card>
        <CardPad>
          <CardHeader
            title="Вход"
            subtitle="JWT сохраняется в памяти + localStorage (учебный вариант)"
          />
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
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <div className={styles.actions}>
              <Button disabled={loading || !email.trim() || !password} type="submit">
                {loading ? "..." : "Login"}
              </Button>
              <Button variant="ghost" type="button" onClick={() => nav("/register")}>
                Create account
              </Button>
            </div>

            {err && <Alert type="error">{err}</Alert>}
          </form>
        </CardPad>
      </Card>
    </div>
  );
}
