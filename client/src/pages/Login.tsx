import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import api from "@/lib/api";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/users/login", { email, password });
      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.data.user));
        const role = data.data.user.role.toLowerCase();
        if (role === "resident") navigate("/dashboard/resident");
        else if (role === "admin") navigate("/dashboard/admin");
        else if (role === "guard") navigate("/dashboard/guard");
      }
    } catch (error: any) {
      console.error(error);
      // Optional: Add toast error here
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      {/* Back to Home */}
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>

      <div className="w-full max-w-md animate-fade-in-up">
        <Card className="rounded-3xl shadow-elevated border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            {/* Logo */}
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-warm flex items-center justify-center shadow-button">
              <span className="text-primary-foreground font-bold text-2xl">
                P
              </span>
            </div>
            <CardTitle className="text-2xl font-bold">
              Welcome back 👋
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to your Parisar Connect account
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email or Phone
                </Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl h-12 bg-muted/50 border-0 focus-visible:ring-primary"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-xl h-12 bg-muted/50 border-0 focus-visible:ring-primary pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Demo Role Selection */}
              <div className="space-y-2 pt-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Demo: Quick login as
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl h-10 text-sm font-medium hover:bg-soft-peach hover:border-primary hover:text-primary"
                    onClick={() => navigate("/dashboard/resident")}
                  >
                    Resident
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl h-10 text-sm font-medium hover:bg-mint-green hover:border-secondary hover:text-secondary"
                    onClick={() => navigate("/dashboard/admin")}
                  >
                    Admin
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl h-10 text-sm font-medium hover:bg-light-yellow hover:border-warm-orange hover:text-warm-orange"
                    onClick={() => navigate("/dashboard/guard")}
                  >
                    Guard
                  </Button>
                </div>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-warm text-primary-foreground font-bold text-base shadow-button btn-press"
              >
                Login
              </Button>
            </form>

            {/* Sign Up Link */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-primary font-semibold hover:underline"
              >
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
