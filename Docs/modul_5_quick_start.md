# Quick Start Guide - Modul 5: Rekap & Laporan

> **Panduan Cepat** untuk memulai implementasi Modul 5

---

## 📦 Instalasi Dependencies

Sebelum memulai, install library yang diperlukan:

```bash
cd e:\Kasir\frontend
npm install xlsx file-saver recharts react-datepicker
```

---

## 🚀 Langkah Implementasi (Urutan Prioritas)

### Step 1: Backend - Rekap Produksi (PRIORITAS TINGGI)

1. **Buat file route baru**:
   ```bash
   # Buat file backend/routes/rekap.js
   ```

2. **Implementasi endpoint**:
   ```javascript
   // backend/routes/rekap.js
   router.get('/produksi', async (req, res) => {
     const { tanggal } = req.query;
     
     // Query SQL
     const query = `
       SELECT 
         pd.nama_produk,
         p.jam_ambil,
         SUM(pd.qty) AS total_qty
       FROM pesanan p
       JOIN pesanan_detail pd ON p.id = pd.pesanan_id
       WHERE p.tanggal_ambil = ?
         AND p.status NOT IN ('DIBATALKAN')
       GROUP BY pd.nama_produk, p.jam_ambil
       ORDER BY pd.nama_produk, p.jam_ambil
     `;
     
     // Execute query & format response
     // ... (lihat modul_5_rekap_laporan.md untuk detail lengkap)
   });
   ```

3. **Daftarkan route**:
   ```javascript
   // backend/server.js
   const rekapRoutes = require('./routes/rekap');
   app.use('/api/rekap', rekapRoutes);
   ```

4. **Test API**:
   ```bash
   # Jalankan backend
   cd e:\Kasir\backend
   node server.js
   
   # Test dengan browser/Postman:
   # http://localhost:5000/api/rekap/produksi?tanggal=2026-01-28
   ```

---

### Step 2: Frontend - Halaman Rekap Produksi

1. **Buat struktur folder**:
   ```bash
   mkdir -p e:\Kasir\frontend\app\rekap\produksi
   ```

2. **Buat file `app/rekap/layout.js`**:
   ```javascript
   export default function RekapLayout({ children }) {
     return (
       <div className="rekap-container">
         <nav className="rekap-nav">
           <a href="/rekap/produksi">Produksi</a>
           <a href="/rekap/transaksi">Transaksi</a>
           <a href="/rekap/terlaris">Terlaris</a>
         </nav>
         {children}
       </div>
     );
   }
   ```

3. **Buat file `app/rekap/produksi/page.js`**:
   ```javascript
   'use client';
   import { useState } from 'react';
   
   export default function RekapProduksiPage() {
     const [tanggal, setTanggal] = useState(new Date());
     const [data, setData] = useState([]);
     const [loading, setLoading] = useState(false);
     
     async function fetchRekapProduksi() {
       setLoading(true);
       try {
         const response = await fetch(
           `/api/rekap/produksi?tanggal=${formatDate(tanggal)}`
         );
         const result = await response.json();
         if (result.success) {
           setData(result.data);
         }
       } catch (error) {
         console.error('Error:', error);
       } finally {
         setLoading(false);
       }
     }
     
     return (
       <div className="rekap-produksi">
         <h1>🎂 Rekap Produksi Harian</h1>
         
         {/* Form Filter */}
         <div className="filter">
           <input 
             type="date" 
             value={formatDate(tanggal)}
             onChange={(e) => setTanggal(new Date(e.target.value))}
           />
           <button onClick={fetchRekapProduksi}>Lihat Rekap</button>
         </div>
         
         {/* Tabel Rekap */}
         {loading ? (
           <p>Loading...</p>
         ) : (
           <table>
             <thead>
               <tr>
                 <th>Produk</th>
                 <th>Jadwal (qty @jam)</th>
               </tr>
             </thead>
             <tbody>
               {data.map((item, idx) => (
                 <tr key={idx}>
                   <td>{item.nama_produk}</td>
                   <td>{formatJadwal(item.jadwal)}</td>
                 </tr>
               ))}
             </tbody>
           </table>
         )}
       </div>
     );
   }
   
   function formatDate(date) {
     return date.toISOString().split('T')[0];
   }
   
   function formatJadwal(jadwalArray) {
     return jadwalArray
       .map(item => `${item.qty}pcs @${item.jam}`)
       .join(' • ');
   }
   ```

4. **Test UI**:
   ```bash
   cd e:\Kasir\frontend
   npm run dev
   
   # Buka: http://localhost:3000/rekap/produksi
   ```

---

### Step 3: Backend - Rekap Transaksi & Produk Terlaris

Implementasi serupa dengan Step 1, ikuti panduan di [`modul_5_rekap_laporan.md`](file:///e:/Kasir/Docs/modul_5_rekap_laporan.md).

---

### Step 4: Frontend - Halaman Lainnya

Implementasi serupa dengan Step 2, ikuti panduan di [`modul_5_rekap_laporan.md`](file:///e:/Kasir/Docs/modul_5_rekap_laporan.md).

---

## 🎨 Template SQL Query

### Query Rekap Produksi
```sql
SELECT 
    pd.nama_produk,
    p.jam_ambil,
    SUM(pd.qty) AS total_qty
FROM pesanan p
JOIN pesanan_detail pd ON p.id = pd.pesanan_id
WHERE p.tanggal_ambil = ?
  AND p.status NOT IN ('DIBATALKAN')
GROUP BY pd.nama_produk, p.jam_ambil
ORDER BY pd.nama_produk, p.jam_ambil;
```

### Query Rekap Transaksi
```sql
-- Total per status
SELECT 
    status,
    COUNT(*) as jumlah
FROM pesanan
WHERE tanggal_pesan = ?
GROUP BY status;

-- Total keuangan
SELECT 
    COUNT(*) as total_pesanan,
    SUM(total) as total_transaksi,
    SUM(CASE WHEN jenis_bayar = 'DP' THEN dp ELSE 0 END) as total_dp,
    SUM(CASE WHEN jenis_bayar = 'LUNAS' THEN total ELSE 0 END) as total_lunas,
    SUM(sisa_bayar) as sisa_tagihan
FROM pesanan
WHERE tanggal_pesan = ?
  AND status != 'DIBATALKAN';
```

### Query Produk Terlaris
```sql
SELECT 
    pd.nama_produk,
    SUM(pd.qty) as total_qty,
    COUNT(DISTINCT pd.pesanan_id) as total_transaksi,
    SUM(pd.subtotal) as total_pendapatan
FROM pesanan_detail pd
JOIN pesanan p ON pd.pesanan_id = p.id
WHERE p.tanggal_pesan BETWEEN ? AND ?
  AND p.status != 'DIBATALKAN'
GROUP BY pd.nama_produk
ORDER BY total_qty DESC
LIMIT ?;
```

---

## 🧪 Testing Checklist

### Manual Testing
- [ ] Akses `/api/rekap/produksi?tanggal=2026-01-28` → Ada data?
- [ ] Akses `/api/rekap/transaksi?tanggal=2026-01-28` → Ada data?
- [ ] Akses `/api/rekap/terlaris?dari=2026-01-01&sampai=2026-01-31` → Ada data?
- [ ] Akses `/rekap/produksi` → UI tampil?
- [ ] Filter tanggal → Data berubah?
- [ ] Export Excel → File terdownload?

### Test Cases
1. **Data Normal**: Tanggal dengan pesanan aktif
2. **Data Kosong**: Tanggal tanpa pesanan
3. **Pesanan Dibatalkan**: Tidak muncul di rekap
4. **Multiple Jadwal**: Produk dengan beberapa jam ambil berbeda

---

## 📚 Referensi Cepat

| Dokumen | Keterangan |
|---------|------------|
| [`modul_5_rekap_laporan.md`](file:///e:/Kasir/Docs/modul_5_rekap_laporan.md) | Spesifikasi lengkap |
| [`output_modul.md`](file:///e:/Kasir/Docs/output_modul.md) | Spesifikasi umum aplikasi |
| [`task.md`](file:///C:/Users/admin/.gemini/antigravity/brain/51b04238-64e4-49bf-b048-790bbd0b5f7e/task.md) | Checklist implementasi |

---

## 💡 Tips Implementasi

1. **Mulai dari Backend**: Pastikan API berfungsi dulu sebelum bikin UI
2. **Test Incremental**: Test setiap endpoint setelah dibuat
3. **Gunakan Postman**: Untuk test API dengan mudah
4. **Console.log**: Debug data di frontend dengan console.log
5. **Styling Last**: Fokus function dulu, styling belakangan
6. **Git Commit**: Commit setiap fitur selesai

---

## ❗ Troubleshooting

### Error: "Cannot GET /api/rekap/produksi"
- ✅ Pastikan route sudah didaftarkan di server.js
- ✅ Restart backend server

### Error: "CORS"
- ✅ Periksa konfigurasi CORS di backend
- ✅ Pastikan frontend mengakses port yang benar

### Data Tidak Muncul
- ✅ Cek response API di Network tab (DevTools)
- ✅ Pastikan query SQL benar
- ✅ Pastikan ada data di database untuk tanggal tersebut

### Export Excel Tidak Jalan
- ✅ Pastikan library `xlsx` dan `file-saver` sudah terinstall
- ✅ Cek console browser untuk error
- ✅ Test dengan data sederhana dulu

---

## 🎯 Next Steps

Setelah Modul 5 selesai:
1. ✅ Test end-to-end semua modul
2. ✅ Deploy ke production (jika diperlukan)
3. ✅ Buat user documentation
4. ✅ Training untuk user

---

*Selamat mengerjakan! 🚀*
