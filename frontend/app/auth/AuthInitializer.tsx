import { useEffect } from "react";
import Loading from "~/components/loading/Loading";
import {
  authSuccess,
  getCurrentUser,
  setInitialized,
} from "~/redux/login-slice/login.slice";
import { useAppDispatch, useTypedSelector } from "~/redux/store";

interface AuthInitializerProps {
  children: React.ReactNode;
}

export function AuthInitializer({ children }: AuthInitializerProps) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, initialized } = useTypedSelector(
    (state) => state.auth
  );

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");

      if (initialized || !token) {
        dispatch(setInitialized());
        return;
      }

      if (token && !isAuthenticated) {
        try {
          await dispatch(authSuccess(token)).unwrap();
          await dispatch(getCurrentUser()).unwrap();
        } catch (error) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          console.log("AuthInitializer failed:", error);
        } finally {
          dispatch(setInitialized()); // Always mark as initialized
        }
      }
    };

    initializeAuth();
  }, [dispatch, isAuthenticated, initialized]);

  // Show loading while initializing auth
  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 flex items-center justify-center flex-col">
          <Loading />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
