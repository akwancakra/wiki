import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { generatePageTree } from "@/lib/dynamic-source";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default async function Layout({ children }: { children: ReactNode }) {
  const tree = await generatePageTree();

  return (
    <DocsLayout
      tree={tree}
      nav={{
        title: "CYS Wiki",
      }}
    >
      {children}
    </DocsLayout>
  );
}
