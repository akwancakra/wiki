import { notFound } from "next/navigation";
import SplitViewEditorWithToast from "../../_components/split-view-editor";
import { getMDXFileBySlug } from "@/lib/mdx-utils";
import { getServerSession } from "next-auth";
import { isAdmin as checkIsAdmin } from "@/lib/auth-utils";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { authOptions } from "@/lib/auth-options";

export const metadata = {
  title: "Edit | CyberSec Docs",
  description: "Edit a documentation page.",
};

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface EditFileResponse {
  success: boolean;
  metadata: {
    title?: string;
    description?: string;
  };
  content: string;
  filePath: string;
  error?: string;
}

async function getFileContent(
  slug: string[]
): Promise<EditFileResponse | null> {
  try {
    // Use MDX utils to get file (handles sanitized slugs properly)
    const mdxFile = await getMDXFileBySlug(slug);

    if (!mdxFile) {
      return null;
    }

    return {
      success: true,
      metadata: {
        title: mdxFile.data.title,
        description: mdxFile.data.description,
      },
      content: mdxFile.content,
      filePath: mdxFile.filePath,
    };
  } catch (error) {
    console.error("Error getting file content:", error);
    return null;
  }
}

export default async function EditPage({ params }: any) {
  const session = await getServerSession(authOptions);
  const isAdmin = session && checkIsAdmin(session);
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-yellow-600 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Akses Ditolak</h2>
          <p className="text-gray-600">
            Halaman ini hanya bisa diakses oleh admin.
          </p>
          <Button asChild className="mt-4">
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </div>
      </div>
    );
  }
  const slug = params.slug;

  try {
    // Get file content via MDX utils (more efficient than API call)
    const fileData = await getFileContent(slug);

    if (!fileData || !fileData.success) {
      notFound();
    }

    const editModeData = {
      content: fileData.content,
      metadata: fileData.metadata,
      filePath: fileData.filePath,
    };

    // Render split-view editor with data from API
    return <SplitViewEditorWithToast editMode={editModeData} />;
  } catch (error) {
    console.error("Error loading page for editing:", error);
    notFound();
  }
}
