import CreateEditorClient from "./client-editor";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { isAdmin as checkIsAdmin } from "@/lib/auth-utils";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "Create | CyberSec Docs",
  description: "Create a new documentation page.",
};

export default async function CreateEditorPage({ searchParams }: any) {
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
  const type = searchParams?.type;
  return <CreateEditorClient type={type} />;
}
