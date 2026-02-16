import { NavLink, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useTelegram } from "../hooks/useTelegram";
import { useTelegramBackButton } from "../hooks/useTelegramBackButton";
import { Button } from "../../ui/Button";
import styles from "./Layout.module.css";

function cls(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

export function Layout() {
  const { isAuthed, user, logout } = useAuth();
  const { webApp, theme } = useTelegram();

  useTelegramBackButton();

  useEffect(() => {
    if (!webApp) return;
    webApp.ready();
    webApp.expand();

    // Опционально применим Telegram theme params (если есть)
    // Не делаем “жёсткую” замену всех цветов — только фон/текст.
    if (theme?.bg_color) document.documentElement.style.setProperty("--bg", theme.bg_color);
    if (theme?.text_color) document.documentElement.style.setProperty("--text", theme.text_color);
  }, [webApp, theme]);

  return (
    <div className={styles.shell}>
      <div className={styles.container}>
        <header className={styles.topbar}>
          <div className={styles.brand}>
            <div className={styles.logo} />
            <div className={styles.title}>
              <strong>Online Library</strong>
              <span>Telegram Mini App</span>
            </div>
          </div>

          <nav className={styles.nav}>
            <NavLink
              to="/books"
              className={({ isActive }) => cls(styles.navLink, isActive && styles.navLinkActive)}
            >
              Books
            </NavLink>

            {isAuthed && (
              <NavLink
                to="/favorites"
                className={({ isActive }) => cls(styles.navLink, isActive && styles.navLinkActive)}
              >
                Favorites
              </NavLink>
            )}

            {user?.role === "admin" && (
              <NavLink
                to="/admin"
                className={({ isActive }) => cls(styles.navLink, isActive && styles.navLinkActive)}
              >
                Admin
              </NavLink>
            )}
          </nav>

          <div className={styles.right}>
            {isAuthed ? (
              <>
                <span className={styles.userBadge}>
                  {user?.email} · {user?.role ?? "user"}
                </span>
                <Button variant="ghost" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) => cls(styles.navLink, isActive && styles.navLinkActive)}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className={({ isActive }) => cls(styles.navLink, isActive && styles.navLinkActive)}
                >
                  Register
                </NavLink>
              </>
            )}
          </div>
        </header>

        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
