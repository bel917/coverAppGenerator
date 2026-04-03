import { Navigate, Outlet, useLocation } from "react-router";
import { hasStoredToken } from "@/lib/auth";

export function ProtectedRoute() {
  const location = useLocation();

  if (!hasStoredToken()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
