# Dummy Admin Accounts

Dokumentasi untuk akun dummy admin yang tersedia dalam sistem untuk development dan testing.

## Akun Yang Tersedia

### Admin Account (Single Active Account)

| Username | Password   | Role  | Deskripsi                  |
| -------- | ---------- | ----- | -------------------------- |
| `admin`  | `admin123` | admin | Akun admin standar (AKTIF) |

### Inactive Accounts (For Reference Only)

| Username     | Password   | Role  | Status   | Deskripsi                |
| ------------ | ---------- | ----- | -------- | ------------------------ |
| `superadmin` | `super123` | admin | DISABLED | Akun super admin         |
| `testadmin`  | `test123`  | admin | DISABLED | Akun admin untuk testing |

### User Account

| Username | Password   | Role | Deskripsi                     |
| -------- | ---------- | ---- | ----------------------------- |
| `dummy`  | `dummy123` | user | Akun user biasa untuk testing |

## Cara Penggunaan

### 1. Login Manual

1. Masuk ke halaman login (`/login`)
2. Masukkan username dan password dari tabel di atas
3. Klik "Login with Telyus"

### 2. Quick Login (Development Mode Only)

Jika aplikasi berjalan dalam development mode (`NODE_ENV=development`), akan muncul section "Development Mode - Authentication" yang berisi:

- Daftar akun dummy yang tersedia
- Tombol quick login untuk setiap akun
- Informasi bahwa sistem akan mengecek dummy accounts terlebih dahulu sebelum Telyus API

## Alur Autentikasi

1. **Cek Dummy Admin**: Sistem akan mengecek terlebih dahulu apakah credentials cocok dengan akun dummy
2. **Fallback ke Telyus API**: Jika tidak cocok dengan akun dummy, sistem akan menggunakan Telyus API
3. **Logging**: Semua login attempt akan dicatat dengan provider information

## Keamanan

⚠️ **PENTING**: Akun dummy admin ini hanya untuk development dan testing. Pastikan untuk:

- Tidak menggunakan akun ini di production
- Menggunakan environment variable untuk mengontrol availability
- Mengganti password default jika diperlukan

## Konfigurasi

Akun dummy admin didefinisikan dalam fungsi `validateDummyAdmin()` di file:

```
src/app/api/auth/[...nextauth]/route.ts
```

Untuk menambah atau mengubah akun dummy, edit array `dummyAdmins` dalam fungsi tersebut.

## Environment Variables

Tidak ada environment variable khusus yang diperlukan untuk akun dummy admin. Namun, untuk keamanan production, Anda bisa menambahkan:

```env
ENABLE_DUMMY_ADMIN=false  # Set ke true hanya untuk development
```

Dan menambahkan kondisi check di `validateDummyAdmin()` function.
