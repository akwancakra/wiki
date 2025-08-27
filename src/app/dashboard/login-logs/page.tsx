"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLoginLogs, useLoginLogStats } from "@/hooks/use-login-logs";
import {
  formatLoginTime,
  getDeviceIcon,
  getBrowserIcon,
  getOSIcon,
  getStatusBadgeColor,
} from "@/lib/login-log-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays,
  RefreshCw,
  Filter,
  Download,
  Users,
  Shield,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function LoginLogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);

  const {
    logs,
    loading,
    error,
    filters,
    pagination,
    hasAdminAccess,
    updateFilters,
    changePage,
    refresh,
    clearFilters,
  } = useLoginLogs();

  const { stats, loading: statsLoading } = useLoginLogStats();

  // Redirect if not admin
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!hasAdminAccess) {
    router.push("/dashboard");
    return null;
  }

  const handleDateRangeChange = (
    field: "startDate" | "endDate",
    value: string
  ) => {
    updateFilters({ [field]: value });
  };

  const handleFilterChange = (field: string, value: any) => {
    updateFilters({ [field]: value === "all" ? null : value });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Login Logs</h1>
          <p className="text-muted-foreground">
            Monitor dan analisis aktivitas login pengguna
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                Total Login
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLogins}</div>
              <p className="text-xs text-muted-foreground">
                {stats.uniqueUsers} pengguna unik
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                Login Berhasil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.successfulLogins}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.successRate.toFixed(1)}% success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <XCircle className="w-4 h-4 mr-2 text-red-600" />
                Login Gagal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.failedLogins}
              </div>
              <p className="text-xs text-muted-foreground">
                Perlu perhatian jika tinggi
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Browser Teratas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {stats.topBrowsers[0]?.browser || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.topBrowsers[0]?.count || 0} penggunaan
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Logs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select
                  value={
                    filters.success === null
                      ? "all"
                      : filters.success?.toString()
                  }
                  onValueChange={(value) =>
                    handleFilterChange("success", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="true">Berhasil</SelectItem>
                    <SelectItem value="false">Gagal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Provider
                </label>
                <Select
                  value={filters.provider || "all"}
                  onValueChange={(value) =>
                    handleFilterChange("provider", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Provider</SelectItem>
                    <SelectItem value="telyus-api">Telyus API</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tanggal Mulai
                </label>
                <Input
                  type="date"
                  value={filters.startDate || ""}
                  onChange={(e) =>
                    handleDateRangeChange("startDate", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tanggal Akhir
                </label>
                <Input
                  type="date"
                  value={filters.endDate || ""}
                  onChange={(e) =>
                    handleDateRangeChange("endDate", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={clearFilters}>
                Reset Filter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Aktivitas Login</CardTitle>
              <CardDescription>
                Menampilkan {logs.length} dari {pagination.total} total logs
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              <span>Memuat data...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada data login log
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div key={log.sessionId} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusBadgeColor(log.success)}>
                          {log.success ? "Berhasil" : "Gagal"}
                        </Badge>
                        <Badge variant="outline">{log.provider}</Badge>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatLoginTime(log.requestInfo.timestamp)}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">User:</span>
                      <div className="text-muted-foreground">
                        {log.user.name || log.user.email}
                        {log.user.role && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {log.user.role}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Provider: Telyus API
                      </div>
                    </div>

                    <div>
                      <span className="font-medium">IP Address:</span>
                      <div className="text-muted-foreground font-mono">
                        {log.requestInfo.ip}
                      </div>
                    </div>

                    <div>
                      <span className="font-medium">Device:</span>
                      <div className="text-muted-foreground">
                        {getDeviceIcon(log.requestInfo.device)}{" "}
                        {log.requestInfo.device}
                        {log.requestInfo.isMobile && " (Mobile)"}
                      </div>
                    </div>

                    <div>
                      <span className="font-medium">Browser & OS:</span>
                      <div className="text-muted-foreground">
                        {getBrowserIcon(log.requestInfo.browser)}{" "}
                        {log.requestInfo.browser} on{" "}
                        {getOSIcon(log.requestInfo.os)} {log.requestInfo.os}
                      </div>
                    </div>
                  </div>

                  {log.requestInfo.userAgent && (
                    <details className="mt-3">
                      <summary className="text-sm font-medium cursor-pointer">
                        User Agent
                      </summary>
                      <div className="text-xs text-muted-foreground mt-2 font-mono bg-muted p-2 rounded">
                        {log.requestInfo.userAgent}
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Halaman {pagination.page} dari {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
