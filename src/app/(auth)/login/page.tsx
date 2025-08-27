"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail, Lock, Shield } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const error = searchParams.get("error");

  // Show error toast if redirected with error
  useEffect(() => {
    if (error === "invalid-role") {
      toast({
        title: "Invalid Role",
        description:
          "Your account role is not valid. Please contact administrator.",
        variant: "destructive",
      });
    } else if (error === "access-denied") {
      toast({
        title: "Access Denied",
        description: "Please login to access this page.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Redirect if user is already logged in
  useEffect(() => {
    if (status === "authenticated" && session) {
      console.log("User already logged in, redirecting to dashboard");
      router.replace("/dashboard");
    }
  }, [session, status, router]);

  // Quick login function for dummy accounts (development only)
  const quickLogin = (username: string, password: string) => {
    setFormData({ email: username, password });
    setTimeout(() => {
      document.querySelector("form")?.requestSubmit();
    }, 100);
  };

  // Note: Redirect logic handled by middleware

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        // Tentukan pesan error berdasarkan jenis kesalahan
        let errorMessage = "Invalid NIK/Username or password";

        if (
          result.error.includes("network") ||
          result.error.includes("unavailable")
        ) {
          errorMessage =
            "Telyus authentication service is unavailable. Please try again later.";
        } else if (result.error.includes("configuration")) {
          errorMessage =
            "System configuration error. Please contact the administrator.";
        }

        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else if (result?.ok) {
        toast({
          title: "Login Successful",
          description: "Welcome! You will be redirected to the dashboard.",
        });

        // Redirect to dashboard after successful login
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      }
    } catch (error) {
      console.error("Login error:", error);

      toast({
        title: "Login Failed",
        description: "A system error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome</h1>
          <p className="text-muted-foreground mt-2">
            Login to Telyus Cybersecurity Documentation System
          </p>
        </div>

        {/* Development Info - Only show in development */}
        {/* {process.env.NODE_ENV === "development" && ( */}
        <div className="my-6 p-4 bg-card border border-border rounded-lg">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            🔧 Development Mode - Authentication
          </h3>
          <div className="text-xs text-muted-foreground space-y-2">
            <div>
              <p className="font-medium text-foreground mb-1">
                Dummy Admin Accounts:
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => quickLogin("admin", "admin123")}
                  disabled={isLoading}
                >
                  Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => quickLogin("dummy", "dummy123")}
                  disabled={isLoading}
                >
                  Dummy User
                </Button>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-border">
              <p>
                <strong>Note:</strong> System will check dummy accounts first,
                then fallback to Telyus API
              </p>
              <p>
                Enter your Telyus NIK/Username and Password for real
                authentication
              </p>
            </div>
          </div>
        </div>
        {/* )} */}

        {/* Login Card */}
        <div className="bg-card rounded-xl shadow-lg border border-border p-6">
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NIK/Username Input */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                NIK / Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="text"
                  placeholder="Enter your Telyus NIK or Username"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your Telyus Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Login with Telyus"}
            </Button>
          </form>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              By logging in, you agree to the{" "}
              <button className="text-primary hover:underline">
                Terms & Conditions
              </button>{" "}
              and{" "}
              <button className="text-primary hover:underline">
                Privacy Policy
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button className="text-primary hover:underline font-medium">
              Contact Administrator
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
