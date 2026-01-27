# Panduan Deployment Gratis Seumur Hidup
**Stack:** TiDB Cloud (MySQL) + Render (Backend) + Vercel (Frontend)

## 1. Setup Database MySQL Gratis (TiDB Cloud)
1. Buka [TiDB Cloud](https://tidbcloud.com/) dan Daftar (Sign Up).
2. Buat Cluster baru:
   - Pilih **Serverless** (Free plan).
   - Region: Pilih yang terdekat atau default (biasanya AWS Oregon/Singapore).
   - Beri nama cluster, misal: `kasir-db`.
3. Setelah aktif, klik **Connect**.
4. Pilih "Connect with General" atau "Node.js".
5. Salin detail berikut ke Notepad/Catatan sementar:
   - **Host** (misal: `gateway01.xxx.tidbcloud.com`)
   - **Port** (biasanya `4000`)
   - **User** (misal: `xxxx.root`)
   - **Password** (Klik "Generate Password" jika belum ada)
6. **PENTING:** Anda perlumenjalankan script SQL inisialisasi. 
   - Download/Install aplikasi **DBeaver** atau **HeidiSQL** di laptop.
   - Atau gunakan fitur **"SQL Editor"** di dashboard TiDB Cloud.
   - Copy isi file `backend/config/init_mysql.sql` dan jalankan (Execute) di sana untuk membuat tabel.

## 2. Deploy Backend (Render)
1. Push kode Anda ke GitHub (jika belum).
2. Buka [Render.com](https://render.com/) dan Daftar.
3. Klik **New +** -> **Web Service**.
4. Pilih repository `Kasir`.
5. Setting:
   - **Name**: `kasir-backend` (atau nama lain)
   - **Region**: Singapore (biar cepat dari Indo)
   - **Branch**: `main`
   - **Root Directory**: `backend` (PENTING! karena folder backend ada di dalam)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Instance Type**: Free
6. Scroll ke bawah, cari **Environment Variables**, klik "Add Environment Variable":
   - `DB_HOST`: (Isi dari TiDB)
   - `DB_USER`: (Isi dari TiDB)
   - `DB_PASSWORD`: (Isi dari TiDB)
   - `DB_NAME`: `kasir_puas` (jika default TiDB pakai 'test', ganti nama database ini)
   - `DB_PORT`: `4000`
   - `PORT`: `3001`
7. Klik **Create Web Service**.
8. Tunggu sampai status **Live**. Copy URL backend Anda (misal: `https://kasir-backend.onrender.com`).

## 3. Deploy Frontend (Vercel)
1. Buka Project di VS Code.
2. Edit file koneksi API di frontend agar menunjuk ke URL Render, BUKAN localhost.
   - Cek file `frontend/app/...` di mana Anda memanggil `fetch`.
   - Sebaiknya buat file `.env.local` di frontend: `NEXT_PUBLIC_API_URL=https://kasir-backend.onrender.com`
   - Dan ubah kodingan fetch menjadi `${process.env.NEXT_PUBLIC_API_URL}/api/produk`
3. Push perubahan ke GitHub.
4. Buka [Vercel.com](https://vercel.com/) dan Daftar.
5. **Add New...** -> **Project**.
6. Import repository `Kasir`.
7. Setting:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend` (Edit -> pilih folder frontend)
8. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: `https://kasir-backend.onrender.com` (tanpa slash di akhir)
9. Klik **Deploy**.

**Selesai!** Website kasir Anda sekarang online. 

> **Catatan:** Karena pakai Render Free Tier, jika website tidak dibuka selama 15 menit, backend akan "tidur". Saat dibuka lagi pertama kali, mungkin loadingnya lama (30-60 detik). Setelah itu akan cepat kembali.
