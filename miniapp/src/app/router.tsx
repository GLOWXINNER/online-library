import React from "react";
import { Navigate, createHashRouter } from "react-router-dom";
import { Layout } from "./layout/Layout";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { BooksPage } from "../pages/BooksPage";
import { BookDetailsPage } from "../pages/BookDetailsPage";
import { FavoritesPage } from "../pages/FavoritesPage";
import { AdminPage } from "../pages/AdminPage";
import { useAuth } from "./providers/AuthProvider";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthed, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!isAuthed) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/books" replace />;
  return <>{children}</>;
}

export const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Navigate to="/books" replace /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },

      { path: "/books", element: <BooksPage /> },
      { path: "/books/:id", element: <BookDetailsPage /> },

      {
        path: "/favorites",
        element: (
          <RequireAuth>
            <FavoritesPage />
          </RequireAuth>
        ),
      },
      {
        path: "/admin",
        element: (
          <RequireAdmin>
            <AdminPage />
          </RequireAdmin>
        ),
      },
    ],
  },
]);
