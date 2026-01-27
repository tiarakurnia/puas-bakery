# Migrasi Backend ke Next.js (Fullstack)

Rencana ini akan menggabungkan kode backend (Express) ke dalam frontend (Next.js) agar bisa deploy gratis di Vercel tanpa kartu kredit.

## User Review Required

> [!IMPORTANT]
> **Perubahan Struktur Project**
> Folder `backend` tidak akan dipakai lagi. Semua logika server akan pindah ke `frontend/app/api`.
> URL API akan berubah dari `http://localhost:3001/api/...` menjadi `http://localhost:3000/api/...` (atau relatif `/api/...`).

## Proposed Changes

### 1. Dependencies
#### [MODIFY] [frontend/package.json](file:///e:/Kasir/frontend/package.json)
- Install `mysql2` dan `dotenv` di folder frontend.

### 2. Database Connection
#### [NEW] [frontend/lib/db.js](file:///e:/Kasir/frontend/lib/db.js)
- Pindahkan konfigurasi koneksi MySQL dari backend ke sini.
- Pastikan menggunakan variable environment yang sama (`DB_HOST`, dll).

### 3. API Routes (Migrasi dari Express)
#### [NEW] [frontend/app/api/produk/route.js](file:///e:/Kasir/frontend/app/api/produk/route.js)
- Handle GET (list produk) dan POST (tambah produk).

#### [NEW] [frontend/app/api/produk/[id]/route.js](file:///e:/Kasir/frontend/app/api/produk/[id]/route.js)
- Handle GET (detail), PUT (update), DELETE (hapus).

#### [NEW] [frontend/app/api/customer/route.js](file:///e:/Kasir/frontend/app/api/customer/route.js)
- Migrasi logika customer.

#### [NEW] [frontend/app/api/transaksi/route.js](file:///e:/Kasir/frontend/app/api/transaksi/route.js)
- Migrasi logika transaksi.

### 4. Frontend Update
- Update pemanggilan API di frontend agar tidak lagi ditembak ke port 3001, tapi ke `/api/...` (internal).

## Verification Plan
1. Jalankan `npm run dev` di frontend.
2. Cek apakah API `/api/produk` bisa diakses di browser/Postman.
3. Cek fitur frontend yang sudah ada (menu produk/customer) apakah masih jalan.
