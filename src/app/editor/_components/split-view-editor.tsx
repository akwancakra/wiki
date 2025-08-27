"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  Eye,
  EyeOff,
  Wand2,
  Loader2,
  Palette,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ToastProvider } from "@/components/ui/use-toast";
import { SaveDialog } from "@/app/editor/_components/save-dialog";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import MDXCodeEditor from "./mdx-code-editor";
import MDXPreview from "./mdx-preview";
import { useRouter } from "next/navigation";

interface EditModeData {
  content: string;
  metadata: {
    title?: string;
    description?: string;
  };
  filePath: string;
}

interface SplitViewEditorProps {
  editMode?: EditModeData;
}

const SplitViewEditor = ({ editMode }: SplitViewEditorProps) => {
  const router = useRouter();
  const [mdxContent, setMdxContent] = useState(
    editMode?.content ||
      `---
title: "New Document"
description: "A new MDX document"
---

# Welcome to MDX Editor

This is a **split view** editor for MDX files with **AI Enhancement**.

## Features

- 🎨 Live preview
- 📝 Syntax highlighting
- 🔥 Hot reload
- 📱 Responsive layout
- 🤖 **AI Enhancement** - Perbaiki format otomatis!

## Test AI Enhancement

Silakan test fitur AI Enhancement dengan contoh format yang rusak di bawah:

### Format Table Yang Rusak

| Nama    | Status | Keterangan              |
| ------- | ------ | ----------------------- |
| Editor  | ✅     | Just Testing |
| Preview | ✅     | Real-time preview       |
| AI      | ✅     | Gemini powered          |

### Code Blocks

\`\`\`javascript
function test() {
          // code block tidak tertutup
}
\`\`\`

## Normal Content

<Callout type="info">
Gunakan tombol "AI Enhancement" di toolbar untuk memperbaiki format di atas!
</Callout>

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Perbaiki Format</TabsTrigger>
    <TabsTrigger value="tab2">Rapikan Layout</TabsTrigger>
    <TabsTrigger value="tab3">Tingkatkan Konten</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    Pilih **"Perbaiki Syntax & Format"** untuk memperbaiki syntax error dan format yang rusak.
  </TabsContent>
  <TabsContent value="tab2">
    Pilih **"Rapikan Format"** untuk merapikan spacing dan konsistensi format tanpa mengubah konten.
  </TabsContent>
  <TabsContent value="tab3">
    Pilih **"Tingkatkan Konten"** untuk meningkatkan presentasi dan penggunaan komponen yang lebih baik.
  </TabsContent>
</Tabs>

Enjoy writing with AI! 🚀`
  );

  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [fileName, setFileName] = useState(
    editMode?.filePath?.replace(/\.mdx$/, "") || "new-document"
  );
  const [wordCount, setWordCount] = useState(0);
  const [editorTheme, setEditorTheme] = useState<string>("vs-dark");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"split" | "editor" | "preview">(
    "split"
  );
  const { toast } = useToast();
  const [isAiEnhancing, setIsAiEnhancing] = useState(false);

  // Calculate word count
  useEffect(() => {
    const text = mdxContent
      .replace(/---[\s\S]*?---/, "")
      .replace(/<[^>]*>/g, "");
    const words = text.split(/\s+/).filter((word) => word.length > 0);
    setWordCount(words.length);
  }, [mdxContent]);

  // Responsive layout - auto switch to single view on mobile
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      if (window.innerWidth < 768) {
        // Mobile: default to editor view
        if (viewMode === "split") {
          setViewMode("editor");
        }
        setIsPreviewVisible(false);
      } else {
        // Tablet/Desktop: enable split view
        if (viewMode !== "split") {
          setViewMode("split");
          setIsPreviewVisible(true);
        }
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [viewMode]);

  // Extract metadata from frontmatter
  const extractMetadata = (content: string) => {
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      return { title: "", description: "" };
    }

    const frontmatter = frontmatterMatch[1];
    const titleMatch = frontmatter.match(/title:\s*["']([^"']+)["']/);
    const descriptionMatch = frontmatter.match(
      /description:\s*["']([^"']+)["']/
    );

    return {
      title: titleMatch ? titleMatch[1] : "",
      description: descriptionMatch ? descriptionMatch[1] : "",
    };
  };

  // Handle save
  const handleSave = async (
    filePath: string,
    metadata: { title: string; description: string }
  ) => {
    try {
      // Update frontmatter in content
      let contentWithMetadata = mdxContent;

      // Remove existing frontmatter
      contentWithMetadata = contentWithMetadata.replace(
        /^---[\s\S]*?---\n?/,
        ""
      );

      // Add new frontmatter
      const frontmatter = `---
title: "${metadata.title}"
description: "${metadata.description}"
---

`;

      contentWithMetadata = frontmatter + contentWithMetadata;

      const response = await fetch("/api/save-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filePath,
          content: contentWithMetadata.replace(/^---[\s\S]*?---\n/, ""), // Remove frontmatter for API
          metadata,
          isUpdate: !!editMode,
          originalPath: editMode?.filePath,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save file.");
      }

      // Force revalidation
      try {
        const urlPath = filePath.replace(/\.mdx$/, "");
        await fetch("/api/revalidate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: `/docs/${urlPath}`,
          }),
        });
      } catch (revalidateError) {
        console.warn("Revalidation failed:", revalidateError);
      }

      const successMessage = editMode
        ? "File updated successfully!"
        : "File saved successfully!";

      toast({
        title: "Success!",
        description: `${successMessage} Redirecting to view...`,
      });

      // Redirect to the docs page
      const urlPath = filePath.replace(/\.mdx$/, "");
      setTimeout(() => {
        window.location.href = `/docs/${urlPath}`;
      }, 1000);

      setFileName(filePath);
    } catch (error) {
      console.error("Save error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred.";

      toast({
        variant: "destructive",
        title: "Failed to Save",
        description: errorMessage,
      });
      throw error;
    }
  };

  const currentMetadata = extractMetadata(mdxContent);

  // Listen for Monaco Editor save shortcut
  useEffect(() => {
    const handleEditorSave = () => {
      setIsSaveDialogOpen(true);
    };

    window.addEventListener("editor-save", handleEditorSave);
    return () => {
      window.removeEventListener("editor-save", handleEditorSave);
    };
  }, []);

  // AI Enhancement function
  const handleAiEnhancement = async (type: "fix" | "improve" | "format") => {
    setIsAiEnhancing(true);
    try {
      const response = await fetch("/api/ai-enhance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: mdxContent,
          type,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to enhance content");
      }

      setMdxContent(result.enhancedContent);

      const actionText = {
        fix: "diperbaiki",
        improve: "ditingkatkan",
        format: "dirapikan",
      }[type];

      toast({
        title: "AI Enhancement Berhasil!",
        description: `Konten telah ${actionText} oleh AI. ${result.originalLength} → ${result.enhancedLength} karakter.`,
      });
    } catch (error) {
      console.error("AI Enhancement error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal melakukan AI enhancement";

      toast({
        variant: "destructive",
        title: "AI Enhancement Gagal",
        description: errorMessage,
      });
    } finally {
      setIsAiEnhancing(false);
    }
  };

  const themeOptions = [
    // Dark Themes
    {
      category: "🌙 Dark Themes",
      value: "vs-dark",
      label: "VS Code Dark",
      icon: "🌙",
    },
    {
      category: "🌙 Dark Themes",
      value: "hc-black",
      label: "High Contrast Dark",
      icon: "⚫",
    },

    // Light Themes
    {
      category: "☀️ Light Themes",
      value: "vs",
      label: "VS Code Light",
      icon: "☀️",
    },
    {
      category: "☀️ Light Themes",
      value: "hc-light",
      label: "High Contrast Light",
      icon: "⚪",
    },
  ] as const;

  const getCurrentTheme = () => {
    return themeOptions.find((theme) => theme.value === editorTheme);
  };

  const darkThemes = themeOptions.filter(
    (theme) => theme.category === "🌙 Dark Themes"
  );
  const lightThemes = themeOptions.filter(
    (theme) => theme.category === "☀️ Light Themes"
  );

  // Handle view mode changes for mobile
  const handleViewModeChange = (mode: "editor" | "preview") => {
    setViewMode(mode);
    if (mode === "preview") {
      setIsPreviewVisible(true);
    }
  };

  // Mobile toolbar component
  const MobileToolbar = () => (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="px-4">
        <div className="space-y-4 pt-6">
          <div className="space-y-2">
            <h3 className="font-semibold">View Mode</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={viewMode === "editor" ? "default" : "outline"}
                size="sm"
                onClick={() => handleViewModeChange("editor")}
                className="w-full"
              >
                📝 Editor
              </Button>
              <Button
                variant={viewMode === "preview" ? "default" : "outline"}
                size="sm"
                onClick={() => handleViewModeChange("preview")}
                className="w-full"
              >
                👁️ Preview
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Theme</h3>
            <div className="grid grid-cols-1 gap-2">
              {themeOptions.map((theme) => (
                <Button
                  key={theme.value}
                  variant={editorTheme === theme.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setEditorTheme(theme.value);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  <span className="mr-2">{theme.icon}</span>
                  {theme.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">AI Enhancement</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleAiEnhancement("fix");
                  setIsMobileMenuOpen(false);
                }}
                disabled={isAiEnhancing}
                className="w-full justify-start"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Perbaiki Syntax & Format
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleAiEnhancement("format");
                  setIsMobileMenuOpen(false);
                }}
                disabled={isAiEnhancing}
                className="w-full justify-start"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Rapikan Format
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleAiEnhancement("improve");
                  setIsMobileMenuOpen(false);
                }}
                disabled={isAiEnhancing}
                className="w-full justify-start"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Tingkatkan Konten
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              className="w-full"
              onClick={() => {
                setIsSaveDialogOpen(true);
                setIsMobileMenuOpen(false);
              }}
            >
              <Save className="mr-2 h-4 w-4" />
              {editMode ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      <SaveDialog
        open={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        onSave={handleSave}
        initialFileName={fileName}
        initialTitle={currentMetadata.title || editMode?.metadata?.title || ""}
        initialDescription={
          currentMetadata.description || editMode?.metadata?.description || ""
        }
        editMode={editMode}
      />

      <div className="flex h-screen bg-background flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-2 md:p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="font-semibold text-sm md:text-base truncate">
              {editMode
                ? `Editing: ${currentMetadata.title || fileName}`
                : "Create New Document"}
            </h1>
            <Badge variant="outline" className="text-xs hidden sm:inline-flex">
              {window.innerWidth < 768
                ? "Mobile"
                : window.innerWidth < 1024
                ? "Tablet"
                : "Desktop"}
            </Badge>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <Badge
              variant="secondary"
              className="text-xs hidden sm:inline-flex"
            >
              {wordCount} words
            </Badge>

            {/* Desktop Controls */}
            <div className="hidden md:flex items-center gap-2">
              {/* Theme Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    {getCurrentTheme()?.icon}
                    <span className="hidden lg:inline">
                      {getCurrentTheme()?.label}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {/* Dark Themes */}
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b">
                    🌙 Dark Themes (Monaco Built-in)
                  </div>
                  {darkThemes.map((theme) => (
                    <DropdownMenuItem
                      key={theme.value}
                      onClick={() => setEditorTheme(theme.value)}
                      className={editorTheme === theme.value ? "bg-accent" : ""}
                    >
                      <span className="mr-2">{theme.icon}</span>
                      {theme.label}
                      {editorTheme === theme.value && (
                        <span className="ml-auto">✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}

                  {/* Light Themes */}
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b border-t mt-1">
                    ☀️ Light Themes (Monaco Built-in)
                  </div>
                  {lightThemes.map((theme) => (
                    <DropdownMenuItem
                      key={theme.value}
                      onClick={() => setEditorTheme(theme.value)}
                      className={editorTheme === theme.value ? "bg-accent" : ""}
                    >
                      <span className="mr-2">{theme.icon}</span>
                      {theme.label}
                      {editorTheme === theme.value && (
                        <span className="ml-auto">✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}

                  <div className="px-2 py-1.5 text-xs text-muted-foreground border-t mt-1">
                    💡 Only official Monaco Editor themes are supported
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={isAiEnhancing}
                  >
                    {isAiEnhancing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4" />
                    )}
                    <span className="hidden lg:inline">AI Enhancement</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleAiEnhancement("fix")}
                    disabled={isAiEnhancing}
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    Perbaiki Syntax & Format
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleAiEnhancement("format")}
                    disabled={isAiEnhancing}
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    Rapikan Format
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleAiEnhancement("improve")}
                    disabled={isAiEnhancing}
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    Tingkatkan Konten
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPreviewVisible(!isPreviewVisible)}
                className="gap-2"
              >
                {isPreviewVisible ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="hidden lg:inline">
                  {isPreviewVisible ? "Hide Preview" : "Show Preview"}
                </span>
              </Button>

              <Button
                size="sm"
                className="gap-2"
                onClick={() => setIsSaveDialogOpen(true)}
              >
                <Save className="h-4 w-4" />
                <span className="hidden lg:inline">
                  {editMode ? "Update" : "Save"}
                </span>
              </Button>
            </div>

            {/* Mobile Controls */}
            <MobileToolbar />
          </div>
        </header>

        {/* Mobile View Mode Tabs */}
        <div className="md:hidden border-b bg-background">
          <div className="flex">
            <Button
              variant={viewMode === "editor" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewModeChange("editor")}
              className="flex-1 rounded-none"
            >
              📝 Editor
            </Button>
            <Button
              variant={viewMode === "preview" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewModeChange("preview")}
              className="flex-1 rounded-none"
            >
              👁️ Preview
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {/* Desktop/Tablet: Resizable split view */}
          <div className="hidden md:block h-full">
            {isPreviewVisible ? (
              <ResizablePanelGroup direction="horizontal" className="h-full">
                {/* Editor Panel */}
                <ResizablePanel defaultSize={50} minSize={30}>
                  <div className="h-full">
                    <MDXCodeEditor
                      value={mdxContent}
                      onChange={setMdxContent}
                      theme={editorTheme}
                    />
                  </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Preview Panel */}
                <ResizablePanel defaultSize={50} minSize={30}>
                  <div className="h-full">
                    <MDXPreview content={mdxContent} />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            ) : (
              <div className="h-full">
                <MDXCodeEditor
                  value={mdxContent}
                  onChange={setMdxContent}
                  theme={editorTheme}
                />
              </div>
            )}
          </div>

          {/* Mobile: Single view mode */}
          <div className="md:hidden h-full">
            {viewMode === "editor" ? (
              <div className="h-full">
                <MDXCodeEditor
                  value={mdxContent}
                  onChange={setMdxContent}
                  theme={editorTheme}
                />
              </div>
            ) : (
              <div className="h-full">
                <MDXPreview content={mdxContent} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const SplitViewEditorWithToast = ({ editMode }: SplitViewEditorProps) => (
  <ToastProvider>
    <SplitViewEditor editMode={editMode} />
  </ToastProvider>
);

export default SplitViewEditorWithToast;
