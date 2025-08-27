import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

// Interface untuk data login log
interface LoginLogData {
  event: string;
  success: boolean;
  user: {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
  };
  provider: string;
  requestInfo: {
    ip: string;
    userAgent: string;
    browser: string;
    os: string;
    device: string;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    timestamp: string;
    headers: {
      forwarded?: string | null;
      realIp?: string | null;
      host?: string | null;
      referer?: string | null;
    };
  };
  sessionId: string;
}

// Sementara simpan dalam memory - di production gunakan database
let loginLogs: LoginLogData[] = [];

// POST - Simpan log login
export async function POST(req: NextRequest) {
  try {
    const logData: LoginLogData = await req.json();
    
    // Validasi data
    if (!logData.event || !logData.user || !logData.provider) {
      return NextResponse.json(
        { error: 'Data log tidak lengkap' },
        { status: 400 }
      );
    }
    
    // Tambahkan timestamp server jika belum ada
    if (!logData.requestInfo.timestamp) {
      logData.requestInfo.timestamp = new Date().toISOString();
    }
    
    // Simpan log
    loginLogs.push(logData);
    
    // Log ke console untuk debugging
    console.log('=== LOGIN LOG SAVED ===');
    console.log(JSON.stringify(logData, null, 2));
    
    return NextResponse.json(
      { message: 'Log berhasil disimpan', logId: logData.sessionId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving login log:', error);
    return NextResponse.json(
      { error: 'Gagal menyimpan log' },
      { status: 500 }
    );
  }
}

// GET - Ambil log login (perlu autentikasi admin)
export async function GET(req: NextRequest) {
  try {
    // Cek autentikasi (hanya admin yang bisa akses)
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Tidak memiliki akses' },
        { status: 401 }
      );
    }
    
    // Cek role admin
    const userRole = (session.user as any)?.role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Memerlukan akses admin' },
        { status: 403 }
      );
    }
    
    // Parse query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const success = url.searchParams.get('success');
    const provider = url.searchParams.get('provider');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    // Filter logs
    let filteredLogs = [...loginLogs];
    
    if (success !== null) {
      const successFilter = success === 'true';
      filteredLogs = filteredLogs.filter(log => log.success === successFilter);
    }
    
    if (provider) {
      filteredLogs = filteredLogs.filter(log => log.provider === provider);
    }
    
    if (startDate) {
      const start = new Date(startDate);
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.requestInfo.timestamp) >= start
      );
    }
    
    if (endDate) {
      const end = new Date(endDate);
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.requestInfo.timestamp) <= end
      );
    }
    
    // Sorting (terbaru dulu)
    filteredLogs.sort((a, b) => 
      new Date(b.requestInfo.timestamp).getTime() - 
      new Date(a.requestInfo.timestamp).getTime()
    );
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
    
    // Response dengan metadata
    return NextResponse.json({
      logs: paginatedLogs,
      pagination: {
        page,
        limit,
        total: filteredLogs.length,
        totalPages: Math.ceil(filteredLogs.length / limit),
      },
      filters: {
        success,
        provider,
        startDate,
        endDate,
      }
    });
    
  } catch (error) {
    console.error('Error fetching login logs:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data log' },
      { status: 500 }
    );
  }
}

// DELETE - Hapus log lama (cleanup)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Tidak memiliki akses' },
        { status: 401 }
      );
    }
    
    const userRole = (session.user as any)?.role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Memerlukan akses admin' },
        { status: 403 }
      );
    }
    
    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get('days') || '30');
    
    // Hapus log yang lebih lama dari X hari
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const initialCount = loginLogs.length;
    loginLogs = loginLogs.filter(log => 
      new Date(log.requestInfo.timestamp) > cutoffDate
    );
    
    const deletedCount = initialCount - loginLogs.length;
    
    return NextResponse.json({
      message: `Berhasil menghapus ${deletedCount} log lama`,
      deletedCount,
      remainingCount: loginLogs.length,
    });
    
  } catch (error) {
    console.error('Error cleaning up logs:', error);
    return NextResponse.json(
      { error: 'Gagal membersihkan log' },
      { status: 500 }
    );
  }
} 