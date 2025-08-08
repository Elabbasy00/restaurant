import { Navigate, useLocation } from "react-router";
import Loading from "~/components/loading/Loading";
import { useTypedSelector } from "~/redux/store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  fallbackPath?: string;
}

export function ProtectedRoute({
  children,
  requiredPermissions = [],
  fallbackPath = "/login",
}: ProtectedRouteProps) {
  const {
    isAuthenticated,
    AuthSuccessLoading,

    initialized,
  } = useTypedSelector((state) => state.auth);
  const location = useLocation();

  // Show loading while authentication is being processed or not initialized
  if (!initialized || AuthSuccessLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loading />
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // All checks passed, render children
  return <>{children}</>;
}
