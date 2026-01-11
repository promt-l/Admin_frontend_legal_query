import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";


export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { isAuthenticated,user, loading } = useAuth();

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (!isAuthenticated) {
    window.location.href =import.meta.env.VITE_FRONTEND_URL;
    console.log(import.meta.env.VITE_FRONTEND_URL)
    return null;
  }
  if (user?.role?.toLowerCase() !== "admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
