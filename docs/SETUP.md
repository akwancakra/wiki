# Quick Setup Guide - CYS Fumadocs

## 🚀 Prerequisites

- Node.js 18+
- npm atau yarn
- Kredensial API Telyus dari tim Auth_API

## ⚙️ Environment Setup

### 1. Copy Environment Template

```bash
cp env.template .env.local
```

### 2. Update Environment Variables

Buka `.env.local` dan isi dengan nilai yang sesuai:

```env
# Required - Generate di https://generate-secret.vercel.app/32
NEXTAUTH_SECRET=your-generated-secret

# Required - URL aplikasi
NEXTAUTH_URL=http://localhost:3000

# Required - Dari tim Auth_API
TELYUS_APPS_NAME=your-apps-name
TELYUS_APPS_TOKEN=your-apps-token
```

### 3. Install Dependencies

```bash
npm install
# atau
yarn install
```

### 4. Start Development Server

```bash
npm run dev
# atau
yarn dev
```

### 5. Access Application

- **Frontend**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Dashboard**: http://localhost:3000/dashboard

## 🔐 Authentication

### Login Credentials

Gunakan NIK/Username dan Password Telyus Anda yang valid.

### Role Assignment

Edit fungsi `determineUserRole()` di `src/app/api/auth/[...nextauth]/route.ts` untuk menentukan siapa yang mendapat role admin:

```typescript
function determineUserRole(identifier: string): string {
  // Tambahkan NIK admin di sini
  const adminNIKs = [
    "123456789", // Ganti dengan NIK admin sebenarnya
    "987654321",
  ];

  if (adminNIKs.includes(identifier)) {
    return "admin";
  }

  return "user";
}
```

## 📊 Features Available

### For All Users:

- ✅ Login dengan API Telyus
- ✅ Akses dokumentasi cybersecurity
- ✅ View dashboard user

### For Admins:

- ✅ Login logs monitoring (`/dashboard/login-logs`)
- ✅ User activity analytics
- ✅ Document editor access
- ✅ Advanced dashboard features

## 🧪 Testing

### Test Login:

1. Buka http://localhost:3000/login
2. Masukkan NIK/Username Telyus
3. Masukkan Password Telyus
4. Klik "Login dengan Telyus"

### Test Admin Access:

1. Login dengan NIK yang sudah di-set sebagai admin
2. Akses `/dashboard/login-logs`
3. Verifikasi bisa melihat login activities

### Test Role Assignment:

1. Login dengan NIK berbeda
2. Cek role yang di-assign
3. Update `determineUserRole()` jika perlu

## 🚨 Troubleshooting

### "API configuration missing"

- Pastikan `TELYUS_APPS_NAME` dan `TELYUS_APPS_TOKEN` sudah di-set di `.env.local`
- Restart development server: `Ctrl+C` lalu `npm run dev`

### Login Gagal (401/422)

- Cek kredensial dari tim Auth_API sudah benar
- Test API manual dengan tools seperti Postman
- Cek console browser dan server logs

### Role Salah

- Edit fungsi `determineUserRole()`
- Tambahkan NIK ke array `adminNIKs`
- Restart aplikasi

### Network Error

- Cek koneksi internet
- Pastikan firewall tidak block `auth.telyus.co.id`
- Cek proxy settings jika ada

## 📞 Support

### Untuk Kredensial API:

- Hubungi tim Auth_API Telyus
- Minta `AppsName` dan `AppsToken`

### Untuk Issues Teknis:

- Cek console browser (F12)
- Cek server logs di terminal
- Review dokumentasi di `TELYUS_API_SETUP.md`

---

**Happy Coding! 🎉**
