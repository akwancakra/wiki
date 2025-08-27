# Setup API Telyus Authentication

## Environment Variables

Buat file `.env.local` di root project dan tambahkan variabel berikut:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Azure AD Configuration (Optional - if still using Azure AD)
AZURE_AD_CLIENT_ID=your-azure-client-id
AZURE_AD_CLIENT_SECRET=your-azure-client-secret
AZURE_AD_TENANT_ID=your-azure-tenant-id
ALLOWED_TENANT_ID=your-allowed-tenant-id

# Telyus API Configuration
# Values provided by Auth_API team
TELYUS_APPS_NAME=your-apps-name-from-auth-api
TELYUS_APPS_TOKEN=your-apps-token-from-auth-api

# Production URLs
# NEXTAUTH_URL=https://yourdomain.com
```

## Konfigurasi yang Diperlukan

### 1. Dapatkan Kredensial dari Tim Auth_API

Hubungi tim Auth_API untuk mendapatkan:

- **AppsName**: Nama aplikasi yang terdaftar
- **AppsToken**: Token autentikasi untuk aplikasi

### 2. Update Environment Variables

```bash
# Development
TELYUS_APPS_NAME="CyberSec-Docs"
TELYUS_APPS_TOKEN="your-token-here"

# Production
NEXTAUTH_URL="https://yourdomain.com"
```

## API Telyus Details

### Endpoint

```
URL: https://auth.telyus.co.id/v2/account/validate
Method: POST
```

### Headers Required

```json
{
  "Content-Type": "application/json",
  "AppsName": "[Value dari Auth_API]",
  "AppsToken": "[Value dari Auth_API]"
}
```

### Request Body

```json
{
  "username": "NIK_atau_username",
  "password": "password_user"
}
```

### Response Codes

#### ✅ Success (200)

```json
{
  "timestamp": "2020-07-20 16:17:48",
  "code": 200,
  "login": 1,
  "note": "Account has been validated",
  "status": "success"
}
```

#### ❌ Missing Headers (401)

```json
{
  "timestamp": "2020-07-20 16:24:39",
  "code": 401,
  "login": 0,
  "note": "Invalid or missing credential.",
  "status": "fail"
}
```

#### ❌ Various Errors (422)

```json
// Token expired
{
  "code": 422,
  "note": "Your application token has expired, please contact the administrator to extend the period."
}

// Invalid parameters
{
  "code": 422,
  "note": "The application parameters you entered are invalid."
}

// Wrong content type
{
  "code": 422,
  "note": "Content type application/x-www-form-urlencoded not supported"
}

// Missing body
{
  "code": 422,
  "note": "Please make sure all forms are filled out."
}

// User not found
{
  "code": 422,
  "note": "Account not found, please check your account combination."
}

// Wrong credentials
{
  "code": 422,
  "note": "Account did not pass validation, please check your account combination."
}
```

## Role Management

Edit fungsi `determineUserRole` di `/src/app/api/auth/[...nextauth]/route.ts` untuk customize logic penentuan role:

```typescript
function determineUserRole(identifier: string): string {
  // Admin berdasarkan NIK tertentu
  const adminNIKs = [
    "123456789", // NIK admin 1
    "987654321", // NIK admin 2
  ];

  // Admin berdasarkan email
  const adminEmails = ["admin@telyus.co.id", "administrator@telyus.co.id"];

  // Cek admin
  if (
    adminNIKs.includes(identifier) ||
    adminEmails.includes(identifier.toLowerCase())
  ) {
    return "admin";
  }

  // Pattern-based admin (contoh: NIK dimulai dengan "999")
  if (/^999\d{6}$/.test(identifier)) {
    return "admin";
  }

  // Default role
  return "user";
}
```

## Testing

### 1. Development Testing

1. Set environment variables dengan kredensial valid dari Auth_API
2. Jalankan aplikasi: `npm run dev`
3. Akses: `http://localhost:3000/login`
4. Test dengan NIK/username dan password Telyus yang valid

### 2. Verifikasi Integrasi

1. Cek console log untuk melihat response dari API Telyus
2. Test login berhasil dan gagal
3. Verifikasi role assignment
4. Cek login logs di `/dashboard/login-logs` (untuk admin)

### 3. Production Checklist

- [ ] Environment variables configured
- [ ] HTTPS enabled (required untuk production)
- [ ] API credentials dari Auth_API valid
- [ ] NEXTAUTH_URL set correctly
- [ ] Error handling tested
- [ ] Logging system working

## Troubleshooting

### Common Issues

#### 1. "API configuration missing"

- Pastikan `TELYUS_APPS_NAME` dan `TELYUS_APPS_TOKEN` sudah di-set
- Restart development server setelah menambah env vars

#### 2. 401 Unauthorized

- Cek AppsName dan AppsToken benar
- Hubungi tim Auth_API untuk verifikasi kredensial

#### 3. 422 Token Expired

- Token aplikasi sudah expired
- Hubungi tim Auth_API untuk extend token

#### 4. Network Error

- Cek koneksi internet
- Pastikan URL API Telyus dapat diakses
- Cek firewall/proxy settings

#### 5. Login Success tapi Role Salah

- Edit fungsi `determineUserRole`
- Tambahkan NIK/email ke admin list
- Restart aplikasi

### Debug Mode

Enable debug dengan menambah console.log di `/src/app/api/auth/[...nextauth]/route.ts`:

```typescript
// Debug API call
console.log("Calling Telyus API with:", {
  username: username,
  appsName: appsName,
  // Don't log password or token for security
});

// Debug response
console.log("Telyus API Response:", {
  status: response.status,
  body: result,
});

// Debug role assignment
console.log("User role determined:", {
  identifier: username,
  role: userRole,
});
```

## Security Notes

1. **Jangan commit credentials** ke git
2. **Gunakan HTTPS** di production
3. **Rotate tokens** secara berkala
4. **Monitor failed login attempts**
5. **Implement rate limiting** untuk prevent brute force

## Support

Jika ada masalah dengan integrasi:

1. Cek dokumentasi API Telyus terbaru
2. Hubungi tim Auth_API untuk bantuan kredensial
3. Review login logs untuk debug
4. Cek console browser dan server logs

---

**Next Steps:**

1. Dapatkan kredensial dari tim Auth_API
2. Update `.env.local` dengan kredensial valid
3. Test login dengan akun Telyus
4. Deploy dan test di production environment
