// src/routes/Guards.jsx
import { Navigate, Outlet } from "react-router-dom";

/** Only for users that ALREADY have a token */
export function RequireAuth() {
  const hasToken = !!localStorage.getItem("accessToken");
  return hasToken ? <Outlet /> : <Navigate to="/" replace />;
}

/** Only for users that do NOT have a token (e.g. login page) */
export function RequireGuest() {
  const hasToken = !!localStorage.getItem("accessToken");
  return hasToken ? <Navigate to="/home" replace /> : <Outlet />;
}
