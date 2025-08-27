import type { ReactNode } from "react";

export const metadata = {
  title: "Login | CyberSec Docs",
  description: "Login to CyberSec Docs.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen">{children}</div>;
}
