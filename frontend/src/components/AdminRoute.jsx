import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  const isLocalDevelopment =
    process.env.NODE_ENV === "development" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname);

  // Tymczasowy dostęp do panelu tylko podczas npm start na localhost.
  if (isLocalDevelopment) {
    return children;
  }

  if (loading) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center px-5">
        <p className="text-sm uppercase tracking-[0.18em] text-[#5C5A55]">
          Sprawdzanie uprawnień...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};