import "./global.css";
import { RootProvider } from "fumadocs-ui/provider";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { AuthProvider } from "@/app/(auth)/login/_components/provider";
import { Toaster } from "@/components/ui/sonner";
import { ToastProvider } from "@/components/ui/use-toast";
import SearchDialog from "./_components/search";

const inter = Inter({
  subsets: ["latin"],
});

export default function BaseLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          <ToastProvider>
            <RootProvider
              search={{
                SearchDialog,
              }}
            >
              {children}
            </RootProvider>
            <Toaster />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
