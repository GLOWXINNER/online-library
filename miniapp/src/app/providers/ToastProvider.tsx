import React, { createContext, useContext, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./toast.module.css";

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
};

type ToastApi = {
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = (type: ToastType, message: string, title?: string) => {
    const id = uid();
    setItems((prev) => [{ id, type, title, message }, ...prev].slice(0, 4));
    window.setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== id));
    }, 2800);
  };

  const api = useMemo<ToastApi>(
    () => ({
      success: (m, t) => push("success", m, t),
      error: (m, t) => push("error", m, t),
      info: (m, t) => push("info", m, t),
    }),
    []
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div className={styles.host}>
          {items.map((t) => (
            <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
              {t.title && <div className={styles.title}>{t.title}</div>}
              <div className={styles.msg}>{t.message}</div>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
