# Panduan Deployment Vercel (Fullstack Next.js)

Sekarang aplikasi Anda sudah **Fullstack** (Frontend + Backend jadi satu). Anda tidak perlu Render lagi.

## 1. Update Konfigurasi Lokal
1. Buka file `frontend/.env.local` yang baru saja saya buat.
2. Isi `DB_HOST`, `DB_USER`, `DB_PASSWORD`, dll dengan data dari **TiDB Cloud** Anda (sama seperti yang Anda masukkan di Render tadi).
3. Jalankan `npm run dev` di terminal `frontend`.
4. Aplikasi akan jalan di `http://localhost:3000`.

## 2. Push ke GitHub
1. Jalankan command berikut di terminal root project:
   ```bash
   git add .
   git commit -m "Migrasi ke Fullstack Next.js"
   git push origin main
   ```

## 3. Deploy ke Vercel (Gratis & Tanpa Kartu Kredit)
1. Buka Dashboard Vercel.
2. **Add New...** -> **Project**.
3. Import repository `puas-bakery`.
4. Di bagian **Environment Variables**, masukkan 5 data database tadi:
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `DB_PORT`
5. Klik **Deploy**.

**Selesai!**
Sekarang aplikasi Anda (Frontend + Backend) sudah online di Vercel sepenuhnya gratis selamanya.
API Anda sekarang bisa diakses di `/api/produk`, `/api/customer`, dll (relatif terhadap domain Vercel Anda).
