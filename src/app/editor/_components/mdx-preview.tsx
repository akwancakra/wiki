"use client";

import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import { Callout } from "fumadocs-ui/components/callout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, Cards } from "fumadocs-ui/components/card";
import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { PDFViewer } from "@/components/markdown-ui/pdf-viewer";
import { VideoViewer } from "@/components/markdown-ui/video-viewer";
import { Steps, Step } from "fumadocs-ui/components/steps";
import { Banner } from "fumadocs-ui/components/banner";

interface MDXPreviewProps {
  content: string;
}

// Enhanced table components for better styling
const TableComponents = {
  table: ({ children, ...props }: any) => (
    <div className="my-6 overflow-x-auto">
      <table
        className="border-collapse border border-border rounded-lg overflow-hidden w-full"
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: any) => (
    <thead className="bg-muted/50" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }: any) => <tbody {...props}>{children}</tbody>,
  tr: ({ children, ...props }: any) => (
    <tr
      className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
      {...props}
    >
      {children}
    </tr>
  ),
  th: ({ children, ...props }: any) => (
    <th
      className="font-semibold text-left p-3 border-r border-border last:border-r-0 text-sm bg-muted/50"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: any) => (
    <td
      className="p-3 border-r border-border last:border-r-0 text-sm"
      {...props}
    >
      {children}
    </td>
  ),
};

// MDX Components mapping
const components = {
  // Fumadocs components
  Callout,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  Cards,
  Accordion,
  Accordions,
  Steps,
  Step,
  Banner,

  // Custom components
  PDFViewer,
  VideoViewer,

  // Enhanced table components
  ...TableComponents,

  // Enhanced HTML elements with better styling
  h1: ({ children, ...props }: any) => (
    <h1 className="text-3xl font-bold tracking-tight mb-6" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2 className="text-2xl font-semibold tracking-tight mb-4 mt-8" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3 className="text-xl font-semibold tracking-tight mb-3 mt-6" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: any) => (
    <h4 className="text-lg font-semibold tracking-tight mb-2 mt-4" {...props}>
      {children}
    </h4>
  ),
  p: ({ children, ...props }: any) => (
    <p className="leading-7 mb-4" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: any) => (
    <ul className="list-disc ml-6 space-y-1 mb-4" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol className="list-decimal ml-6 space-y-1 mb-4" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: any) => (
    <li className="leading-7" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }: any) => (
    <blockquote
      className="border-l-4 border-muted-foreground/25 pl-4 italic text-muted-foreground my-4"
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ children, ...props }: any) => (
    <code
      className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-sm font-mono"
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ children, ...props }: any) => (
    <pre
      className="bg-muted text-muted-foreground p-4 text-sm rounded-lg font-mono my-4 overflow-x-auto"
      {...props}
    >
      {children}
    </pre>
  ),
  a: ({ children, href, ...props }: any) => (
    <a
      href={href}
      className="text-primary underline decoration-primary underline-offset-4 hover:decoration-2"
      {...props}
    >
      {children}
    </a>
  ),
  img: ({ src, alt, ...props }: any) => (
    <img
      src={src}
      alt={alt}
      className="rounded-lg border my-4 max-w-full h-auto"
      {...props}
    />
  ),
  hr: ({ ...props }) => <hr className="my-6 border-border" {...props} />,
  strong: ({ children, ...props }: any) => (
    <strong className="font-semibold" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }: any) => <em {...props}>{children}</em>,
};

const MDXPreview = ({ content }: MDXPreviewProps) => {
  const [mdxSource, setMdxSource] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processMDX = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Remove frontmatter for preview
        const contentWithoutFrontmatter = content.replace(
          /^---[\s\S]*?---\n?/,
          ""
        );

        // Serialize the MDX content
        const mdxSource = await serialize(contentWithoutFrontmatter, {
          parseFrontmatter: false,
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [],
            development: process.env.NODE_ENV === "development",
          },
        });

        setMdxSource(mdxSource);
      } catch (err) {
        console.error("MDX processing error:", err);
        setError(err instanceof Error ? err.message : "Failed to process MDX");
      } finally {
        setIsLoading(false);
      }
    };

    processMDX();
  }, [content]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
        <h3 className="text-sm font-medium">Preview</h3>
        <div className="text-xs text-muted-foreground">
          {isLoading ? "Processing..." : "Live preview"}
        </div>
      </div>
      <ScrollArea className="flex-1 h-0">
        <div className="p-6 max-w-none min-h-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-muted-foreground">
                Processing MDX content...
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-32">
              <div className="text-sm text-destructive mb-2">
                Error processing MDX:
              </div>
              <div className="text-xs text-muted-foreground text-center">
                {error}
              </div>
            </div>
          ) : mdxSource ? (
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <MDXRemote {...mdxSource} components={components} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-muted-foreground">
                No content to preview
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MDXPreview;
