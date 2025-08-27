import type { ReactNode } from "react";
import { Navbar } from "@/app/(home)/_components/navbar";

export const metadata = {
  title: "Home | CyberSec Docs",
  description: "Complete cybersecurity guide.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
