"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Selamat datang,{" "}
          <span className="font-medium">{session.user?.name}</span>
        </p>
        <Button onClick={() => signOut()} variant="destructive" size="sm">
          Keluar
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => signIn("azure-ad")}
      className="flex items-center gap-2"
      variant="default"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        viewBox="0 0 16 16"
        className="w-4 h-4"
      >
        <path d="M7.462 0H0v7.19h7.462V0zM16 0H8.538v7.19H16V0zM7.462 8.211H0V16h7.462V8.211zm8.538 0H8.538V16H16V8.211z" />
      </svg>
      Masuk dengan Microsoft
    </Button>
  );
}
