# 🔐 Panduan Setup Admin - CYS Fumadocs

## Overview

Sistem ini mendukung beberapa metode untuk menentukan siapa yang memiliki akses admin. Anda bisa menggunakan satu atau kombinasi metode berikut:

## 🎯 Metode Konfigurasi Admin

### **1. Daftar Spesifik (ADMIN_IDENTIFIERS)**

**✅ Recommended untuk tim kecil**

```bash
# .env.local
ADMIN_IDENTIFIERS=123456789,admin@telyus.co.id,987654321,superuser@corp.telyus.co.id
```

**Kapan menggunakan:**

- Tim admin yang kecil dan terbatas
- Kontrol yang sangat ketat
- NIK/email admin sudah pasti dan jarang berubah

### **2. Pattern NIK (ADMIN_NIK_PREFIXES)**

**✅ Recommended untuk organisasi besar**

```bash
# .env.local
ADMIN_NIK_PREFIXES=999,888,ADM,ADMIN
```

**Contoh:**

- NIK `999123456` → Admin (dimulai dengan 999)
- NIK `888987654` → Admin (dimulai dengan 888)
- NIK `ADM001234` → Admin (dimulai dengan ADM)

**Kapan menggunakan:**

- Ada konvensi NIK untuk admin di organisasi
- Tim admin yang besar atau berubah-ubah
- Ingin automatisasi tanpa edit manual

### **3. Domain Email (ADMIN_EMAIL_DOMAINS)**

**✅ Recommended untuk struktur email terorganisir**

```bash
# .env.local
ADMIN_EMAIL_DOMAINS=@telyus.co.id,@corp.telyus.co.id
```

**Syarat tambahan:**

- Email harus mengandung kata "admin" atau "superuser"
- Contoh yang valid: `admin@telyus.co.id`, `superuser@corp.telyus.co.id`
- Contoh yang tidak valid: `john@telyus.co.id` (tidak ada kata "admin")

## 🔧 Setup Step-by-Step

### **Step 1: Pilih Strategi Admin**

**Untuk Tim Kecil (< 10 admin):**

```bash
ADMIN_IDENTIFIERS=nik1,nik2,admin@telyus.co.id
```

**Untuk Tim Besar atau Departemen:**

```bash
ADMIN_NIK_PREFIXES=999,CYS
ADMIN_EMAIL_DOMAINS=@cyber.telyus.co.id
```

**Hybrid (Kombinasi):**

```bash
ADMIN_IDENTIFIERS=emergency@telyus.co.id,12345678
ADMIN_NIK_PREFIXES=999
ADMIN_EMAIL_DOMAINS=@admin.telyus.co.id
```

### **Step 2: Update File Environment**

1. **Copy template:**

```bash
cp env.template .env.local
```

2. **Edit .env.local:**

```bash
# Tambahkan konfigurasi admin sesuai pilihan Anda
ADMIN_IDENTIFIERS=123456789,admin@telyus.co.id
ADMIN_NIK_PREFIXES=999,888
ADMIN_EMAIL_DOMAINS=@telyus.co.id
```

3. **Restart server:**

```bash
npm run dev
```

### **Step 3: Test Admin Access**

1. **Login dengan akun admin**
2. **Cek console logs** untuk memastikan:

```
🔑 Admin access granted for: 999123456
```

3. **Akses dashboard admin:**
   - URL: `/dashboard/login-logs`
   - Should be accessible for admin

## 📋 Contoh Konfigurasi Real

### **Untuk Cybersecurity Team telyus:**

```bash
# Admin spesifik
ADMIN_IDENTIFIERS=supervisor@cyber.telyus.co.id,999888777

# Pattern NIK cyber team (dimulai CYS)
ADMIN_NIK_PREFIXES=CYS,999

# Domain khusus cyber
ADMIN_EMAIL_DOMAINS=@cyber.telyus.co.id,@security.telyus.co.id
```

### **Untuk Regional Office:**

```bash
# Regional admin (NIK dimulai dengan kode regional)
ADMIN_NIK_PREFIXES=REG1,REG2,REG3

# Email admin regional
ADMIN_EMAIL_DOMAINS=@jakarta.telyus.co.id,@surabaya.telyus.co.id
```

## 🚨 Emergency Access

Sistem memiliki emergency admin hardcoded untuk situasi darurat:

- `superadmin`
- `emergency@telyus.co.id`

**⚠️ Hanya untuk emergency! Ganti password emergency admin setelah setup.**

## 🔍 Troubleshooting

### **Admin tidak bisa akses dashboard**

1. **Cek console logs** saat login:

```bash
# Log yang benar untuk admin:
🔑 Admin access granted for: your-nik

# Log untuk user biasa:
👤 User access granted for: your-nik
```

2. **Cek environment variables:**

```bash
# Pastikan .env.local sudah benar
cat .env.local | grep ADMIN
```

3. **Case sensitivity:**
   - Semua identifier dinormalisasi ke lowercase
   - `ADMIN@telyus.CO.ID` = `admin@telyus.co.id`

### **Pattern tidak cocok**

**ADMIN_NIK_PREFIXES=999**

- ✅ NIK: `999123456` → Match
- ❌ NIK: `123999456` → Tidak match (999 bukan di awal)

**ADMIN_EMAIL_DOMAINS=@telyus.co.id**

- ✅ Email: `admin@telyus.co.id` → Match (ada kata "admin")
- ❌ Email: `john@telyus.co.id` → Tidak match (tidak ada kata "admin")

## 🎯 Best Practices

### **1. Security**

- ✅ Gunakan kombinasi metode untuk redundansi
- ✅ Monitor login logs untuk admin access
- ✅ Rotate emergency admin credentials
- ❌ Jangan hardcode NIK di kode production

### **2. Maintenance**

- ✅ Document admin NIK/email changes
- ✅ Test admin access setelah update
- ✅ Backup konfigurasi admin sebelum perubahan

### **3. Scalability**

- ✅ Gunakan pattern untuk tim besar
- ✅ Gunakan specific list untuk kontrol ketat
- ✅ Combine methods untuk flexibility

## 📞 Support

Jika ada masalah dengan setup admin:

1. **Cek logs console** untuk debug info
2. **Verify environment variables** di .env.local
3. **Test dengan emergency admin** terlebih dahulu
4. **Contact system administrator** jika masalah persists

---

**💡 Tip:** Mulai dengan `ADMIN_IDENTIFIERS` untuk setup awal, lalu scale ke pattern-based setelah sistem stabil.
