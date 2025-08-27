import type { ReactNode } from "react";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions } from "@/app/layout.config";
import { Navbar } from "../(home)/_components/navbar";

export const metadata = {
  title: "Dashboard | CyberSec Docs",
  description: "Dashboard for CyberSec Docs.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
