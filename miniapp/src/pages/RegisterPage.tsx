import { useState } from "react";
import { useAuth } from "../app/providers/AuthProvider";
import { useNavigate } from "react-router-dom";

export function RegisterPage() {
  const { register } = useAuth();
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
      await register(email, password);
      nav("/books");
    } catch (e: any) {
      setErr(e?.message ?? "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <p style={{ opacity: 0.8 }}>Password min length is 8 (backend validation).</p>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, maxWidth: 380 }}>
        <input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button disabled={loading}>{loading ? "..." : "Create account"}</button>
        {err && <div style={{ color: "crimson" }}>{err}</div>}
      </form>
    </div>
  );
}
