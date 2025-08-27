"use client";

import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState, Suspense } from "react";
import { getUserRole, isAdmin as checkIsAdmin, ROLES } from "@/lib/auth-utils";
import {
  Shield,
  FileText,
  Settings,
  Users,
  BookOpen,
  Edit3,
  AlertTriangle,
  ChevronRight,
  Activity,
} from "lucide-react";

function DashboardContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const error = searchParams.get("error");

  // Semua hooks harus di sini!
  const [totalDocs, setTotalDocs] = useState<number | null>(null);
  const [totalSizeMB, setTotalSizeMB] = useState<number | null>(null);
  const [updatedThisMonth, setUpdatedThisMonth] = useState<number | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (error === "unauthorized" || error === "access-denied") {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access that page",
        variant: "destructive",
      });
      router.replace("/dashboard");
    }
  }, [error, toast, router]);

  useEffect(() => {
    fetch("/api/docs/count")
      .then((res) => res.json())
      .then((data) => {
        setTotalDocs(data.total);
        setTotalSizeMB(data.totalSizeMB);
        setUpdatedThisMonth(data.updatedThisMonth);
      })
      .catch(() => {
        setTotalDocs(null);
        setTotalSizeMB(null);
        setUpdatedThisMonth(null);
      });
    // Fetch recent activity
    fetch("/api/activity-log")
      .then((res) => res.json())
      .then((data) => setRecentActivity(data.logs || []))
      .catch(() => setRecentActivity([]));
  }, []);

  // Setelah semua hook, baru boleh ada return bersyarat
  if (status === "loading" || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const userRole = getUserRole(session);
  const isAdmin = checkIsAdmin(session);
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-yellow-600 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Akses Ditolak</h2>
          <p className="text-gray-600">
            Halaman dashboard hanya bisa diakses oleh admin.
          </p>
          <Button className="mt-4" onClick={() => router.push("/")}>
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      title: "Security Documentation",
      description: "Security guidelines and best practices",
      icon: Shield,
      href: "/docs",
      available: true,
    },
    // FAQ Database dihapus karena file faq.mdx tidak ada
    {
      title: "Documentation Editor",
      description: "Create and edit documentation",
      icon: Edit3,
      href: "/editor/create",
      available: isAdmin,
      adminOnly: true,
    },
    // User Management dihapus karena route tidak ada
    // System Settings dihapus karena route tidak ada
    {
      title: "Login Logs",
      description: "Monitor user login activities",
      icon: Activity,
      href: "/dashboard/login-logs",
      available: isAdmin,
      adminOnly: true,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Cybersecurity Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Welcome, <span className="font-medium">{session.user?.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isAdmin ? "default" : "secondary"}>
              {isAdmin ? "Administrator" : "User"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards - Only for Admin */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Documents
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalDocs === null ? "..." : totalDocs}
              </div>
              <p className="text-xs text-muted-foreground">
                Jumlah dokumen yang pada sistem
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Size (MB)
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalSizeMB === null ? "..." : totalSizeMB}
              </div>
              <p className="text-xs text-muted-foreground">
                Ukuran total semua dokumen .mdx
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Updated This Month
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {updatedThisMonth === null ? "..." : updatedThisMonth}
              </div>
              <p className="text-xs text-muted-foreground">
                Jumlah dokumen .mdx yang diupdate bulan ini
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions
            .filter((action) => action.available)
            .map((action, index) => (
              <Card
                key={index}
                className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => router.push(action.href)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <action.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {action.title}
                          {action.adminOnly && (
                            <Badge variant="outline" className="text-xs">
                              Admin
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-sm mt-1">
                          {action.description}
                        </CardDescription>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </CardHeader>
              </Card>
            ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="p-6">
            {recentActivity.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Tidak ada aktivitas terbaru</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {recentActivity.slice(0, 5).map((log, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <span className="font-mono text-xs text-muted-foreground">
                      {new Date(log.time).toLocaleString("id-ID")}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-semibold">
                      {log.type === "create" ? "Buat" : "Edit"}
                    </span>
                    <span className="truncate">{log.file}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
