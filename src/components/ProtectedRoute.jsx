import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleToPath = {
  Admin: "/admin",
  Manager: "/manager",
  Employee: "/employee"
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="card px-6 py-4 text-sm font-semibold text-slate-600">
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={roleToPath[user.role] || "/login"} replace />;
  }

  return children;
};

export default ProtectedRoute;
