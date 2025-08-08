import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { FaBurger } from "react-icons/fa6";
import { Navigate, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { loginUser } from "~/redux/login-slice/login.slice";
import { useAppDispatch, useTypedSelector } from "~/redux/store";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  // const hasNavigated = useRef(false);
  const dispatch = useAppDispatch();
  const { loading, isAuthenticated, initialized } = useTypedSelector(
    (state) => state.auth
  );

  // Redirect if already authenticated

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  useEffect(() => {
    console.log(isAuthenticated);
    if (initialized && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (isAuthenticated && initialized) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {/* <img
              src="public/logo.webp"
              alt="Logo"
              className="w-32 h-auto object-cover"
            /> */}
            <FaBurger size={100} />
          </div>
          <CardTitle className="text-2xl">تسجيل دخول المديرين</CardTitle>
          <CardDescription>
            أدخل الايميل و كلمة السر للوصول إلى لوحة الإدارة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الالكتروني</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة السر</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size="sm" className="mr-2" />
                  يتم تسجيل الدخول...
                </>
              ) : (
                "تسجيل دخول"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
