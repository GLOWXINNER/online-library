import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { useTelegram } from "../hooks/useTelegram";
import { useTelegramBackButton } from "../hooks/useTelegramBackButton";
import { useEffect } from "react";

export function Layout() {
  const { isAuthed, user, logout } = useAuth();
  const { webApp, theme } = useTelegram();
  const loc = useLocation();

  useTelegramBackButton();

  useEffect(() => {
    if (!webApp) return;
    webApp.ready();
    webApp.expand();

    // опционально применим цвета темы
    if (theme?.bg_color) document.body.style.background = theme.bg_color;
    if (theme?.text_color) document.body.style.color = theme.text_color;
  }, [webApp, theme]);

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: 16, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
      <header style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <strong>Online Library</strong>
          <nav style={{ display: "flex", gap: 10 }}>
            <Link to="/books">Books</Link>
            {isAuthed && <Link to="/favorites">Favorites</Link>}
            {user?.role === "admin" && <Link to="/admin">Admin</Link>}
          </nav>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {isAuthed ? (
            <>
              <span style={{ opacity: 0.8 }}>{user?.email}</span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              {loc.pathname !== "/login" && <Link to="/login">Login</Link>}
              {loc.pathname !== "/register" && <Link to="/register">Register</Link>}
            </>
          )}
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
