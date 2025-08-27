"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";
import { LoginButton } from "@/app/(auth)/login/_components/login-button";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { getUserRole, isAdmin as checkIsAdmin } from "@/lib/auth-utils";

export function Navbar() {
  const { data: session, status } = useSession();
  const isAdmin = session && checkIsAdmin(session);
  const userName = session?.user?.name || session?.user?.email || "";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo dan Title */}
        <Link href="/" className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-lg">Cys Wiki</span>
        </Link>

        {/* Navigation Items - Center (opsional) */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/docs"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Wiki
          </Link>
          {isAdmin && (
            <Link
              href="/dashboard"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right side items */}
        <div className="flex items-center space-x-2">
          <ThemeSwitcher />
          {status === "authenticated" ? (
            <>
              <span className="text-sm font-medium text-muted-foreground hidden md:inline">
                {userName}
              </span>
              <Button asChild variant="outline">
                <Link href="/api/auth/signout">Logout</Link>
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
