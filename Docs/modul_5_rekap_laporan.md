# Modul 5: Rekap & Laporan - Kasir Puas Bakery

> **Status**: Siap Dikerjakan  
> **Tanggal**: 28 Januari 2026  
> **Prerequisites**: Modul 1-4 sudah selesai

---

## 📋 Deskripsi Modul

Modul ini menyediakan fitur rekap dan laporan untuk membantu owner/staff toko melihat:
1. **Rekap Produksi Harian** - Daftar produk yang harus disiapkan pada tanggal tertentu beserta jadwal pengambilannya
2. **Rekap Transaksi Harian** - Ringkasan jumlah pesanan dan total transaksi per hari
3. **Laporan Produk Terlaris** - Produk dengan penjualan tertinggi dalam periode tertentu

---

## 🎯 Tujuan Utama

### Rekap Produksi Harian
Memudahkan bagian produksi untuk mengetahui:
- **Produk apa saja** yang harus dibuat hari ini
- **Berapa jumlah** masing-masing produk
- **Jam berapa** produk tersebut harus siap diambil

**Format Tampilan**: 1 produk = 1 baris, dengan jadwal pengambilan ditampilkan secara horizontal

**Contoh**:
```
┌───────────────┬─────────────────────────────────────────────────┐
│ Produk        │ Jadwal (qty @jam)                               │
├───────────────┼─────────────────────────────────────────────────┤
│ Donat         │ 50pcs @07:00 • 30pcs @15:00 • 40pcs @17:00      │
│ Roti Coklat   │ 20pcs @07:00 • 15pcs @10:00                     │
│ Kue Lapis     │ 10pcs @15:00                                    │
│ Brownies      │ 5pcs @14:00 • 10pcs @16:00                      │
└───────────────┴─────────────────────────────────────────────────┘
```

---

## 🔧 Implementasi Backend

### 1. API Endpoint: GET /api/rekap/produksi

**Deskripsi**: Mengambil data rekap produksi berdasarkan tanggal pengambilan

**URL**: `/api/rekap/produksi?tanggal=YYYY-MM-DD`

**Method**: `GET`

**Query Parameters**:
| Parameter | Tipe | Wajib | Keterangan |
|-----------|------|-------|------------|
| `tanggal` | DATE | Ya | Tanggal pengambilan pesanan (format: YYYY-MM-DD) |

**Response Success (200)**:
```json
{
  "success": true,
  "tanggal": "2026-01-28",
  "data": [
    {
      "nama_produk": "Donat",
      "total_qty": 120,
      "jadwal": [
        { "jam": "07:00", "qty": 50 },
        { "jam": "15:00", "qty": 30 },
        { "jam": "17:00", "qty": 40 }
      ]
    },
    {
      "nama_produk": "Roti Coklat",
      "total_qty": 35,
      "jadwal": [
        { "jam": "07:00", "qty": 20 },
        { "jam": "10:00", "qty": 15 }
      ]
    }
  ]
}
```

**SQL Query**:
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

**Proses di Backend**:
1. Query mendapatkan semua produk + jam ambil + qty
2. Grouping data berdasarkan `nama_produk`
3. Untuk setiap produk, kumpulkan array jadwal `[{ jam, qty }]`
4. Hitung `total_qty` per produk

---

### 2. API Endpoint: GET /api/rekap/transaksi

**Deskripsi**: Mengambil ringkasan transaksi harian

**URL**: `/api/rekap/transaksi?tanggal=YYYY-MM-DD`

**Method**: `GET`

**Query Parameters**:
| Parameter | Tipe | Wajib | Keterangan |
|-----------|------|-------|------------|
| `tanggal` | DATE | Ya | Tanggal untuk filter transaksi |

**Response Success (200)**:
```json
{
  "success": true,
  "tanggal": "2026-01-28",
  "data": {
    "total_pesanan": 15,
    "pesanan_baru": 5,
    "pesanan_diproses": 3,
    "pesanan_siap": 4,
    "pesanan_selesai": 2,
    "pesanan_batal": 1,
    "total_transaksi": 5450000,
    "total_dp": 2100000,
    "total_lunas": 3350000,
    "sisa_tagihan": 890000
  }
}
```

**SQL Queries**:
```sql
-- Total pesanan per status
SELECT 
    status,
    COUNT(*) as jumlah
FROM pesanan
WHERE tanggal_pesan = ?
GROUP BY status;

-- Total transaksi
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

---

### 3. API Endpoint: GET /api/rekap/produk-terlaris

**Deskripsi**: Mengambil data produk terlaris dalam periode tertentu

**URL**: `/api/rekap/produk-terlaris?dari=YYYY-MM-DD&sampai=YYYY-MM-DD&limit=10`

**Method**: `GET`

**Query Parameters**:
| Parameter | Tipe | Wajib | Default | Keterangan |
|-----------|------|-------|---------|------------|
| `dari` | DATE | Ya | - | Tanggal mulai periode |
| `sampai` | DATE | Ya | - | Tanggal akhir periode |
| `limit` | INT | Tidak | 10 | Jumlah produk yang ditampilkan |

**Response Success (200)**:
```json
{
  "success": true,
  "periode": {
    "dari": "2026-01-01",
    "sampai": "2026-01-28"
  },
  "data": [
    {
      "nama_produk": "Donat",
      "total_qty": 1250,
      "total_transaksi": 950,
      "total_pendapatan": 10000000
    },
    {
      "nama_produk": "Roti Coklat",
      "total_qty": 850,
      "total_transaksi": 720,
      "total_pendapatan": 12750000
    }
  ]
}
```

**SQL Query**:
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

## 🎨 Implementasi Frontend

### 1. Halaman Rekap Produksi

**Path**: `/frontend/app/rekap/produksi/page.js`

**Komponen Utama**:
```
┌─────────────────────────────────────────────────┐
│  🎂 Rekap Produksi Harian                       │
│  ─────────────────────────────────────────────  │
│  Tanggal: [📅 2026-01-28] [Lihat Rekap]        │
│  ─────────────────────────────────────────────  │
│  ┌───────────────┬──────────────────────────┐   │
│  │ Produk        │ Jadwal (qty @jam)        │   │
│  ├───────────────┼──────────────────────────┤   │
│  │ Donat         │ 50pcs @07:00 • 30pcs ... │   │
│  │ Roti Coklat   │ 20pcs @07:00 • 15pcs ... │   │
│  │ Kue Lapis     │ 10pcs @15:00             │   │
│  └───────────────┴──────────────────────────┘   │
│                                                  │
│  Total Produk: 3 item                           │
│  Total Qty: 215 pcs                             │
│                                                  │
│  [📥 Export Excel] [🖨️ Cetak]                  │
└─────────────────────────────────────────────────┘
```

**Fitur**:
- Filter tanggal dengan date picker
- Tabel rekap produksi dengan format jadwal horizontal
- Ringkasan total produk dan qty
- Export ke Excel/CSV
- Cetak rekap (print-friendly layout)

**State Management**:
```javascript
const [tanggal, setTanggal] = useState(new Date());
const [rekapData, setRekapData] = useState([]);
const [loading, setLoading] = useState(false);
const [totalProduk, setTotalProduk] = useState(0);
const [totalQty, setTotalQty] = useState(0);
```

**Fungsi Utama**:
```javascript
// Fetch rekap produksi
async function fetchRekapProduksi(tanggal) {
  const response = await fetch(
    `/api/rekap/produksi?tanggal=${formatDate(tanggal)}`
  );
  const data = await response.json();
  
  if (data.success) {
    setRekapData(data.data);
    calculateTotals(data.data);
  }
}

// Format jadwal untuk tampilan
function formatJadwal(jadwalArray) {
  return jadwalArray
    .map(item => `${item.qty}pcs @${item.jam}`)
    .join(' • ');
}

// Hitung total
function calculateTotals(data) {
  const totalProduk = data.length;
  const totalQty = data.reduce((sum, item) => sum + item.total_qty, 0);
  setTotalProduk(totalProduk);
  setTotalQty(totalQty);
}
```

---

### 2. Halaman Rekap Transaksi

**Path**: `/frontend/app/rekap/transaksi/page.js`

**Komponen Utama**:
```
┌─────────────────────────────────────────────────┐
│  💰 Rekap Transaksi Harian                      │
│  ─────────────────────────────────────────────  │
│  Tanggal: [📅 2026-01-28] [Lihat Rekap]        │
│  ─────────────────────────────────────────────  │
│  📊 Ringkasan Pesanan                           │
│  ┌─────────────────┬─────────┐                  │
│  │ Total Pesanan   │    15   │                  │
│  │ Baru            │     5   │                  │
│  │ Diproses        │     3   │                  │
│  │ Siap Diambil    │     4   │                  │
│  │ Selesai         │     2   │                  │
│  │ Dibatalkan      │     1   │                  │
│  └─────────────────┴─────────┘                  │
│                                                  │
│  💵 Ringkasan Keuangan                          │
│  ┌─────────────────┬─────────────────┐          │
│  │ Total Transaksi │ Rp  5.450.000   │          │
│  │ Total DP        │ Rp  2.100.000   │          │
│  │ Total Lunas     │ Rp  3.350.000   │          │
│  │ Sisa Tagihan    │ Rp    890.000   │          │
│  └─────────────────┴─────────────────┘          │
│                                                  │
│  [📥 Export Excel]                              │
└─────────────────────────────────────────────────┘
```

---

### 3. Halaman Produk Terlaris

**Path**: `/frontend/app/rekap/terlaris/page.js`

**Komponen Utama**:
```
┌─────────────────────────────────────────────────┐
│  🏆 Produk Terlaris                             │
│  ─────────────────────────────────────────────  │
│  Periode:                                       │
│  Dari: [📅 2026-01-01]                         │
│  Sampai: [📅 2026-01-28]                       │
│  [Lihat Data]                                   │
│  ─────────────────────────────────────────────  │
│  ┌────┬─────────────┬─────┬─────┬───────────┐  │
│  │ #  │ Produk      │ Qty │ Trx │ Pendapatan│  │
│  ├────┼─────────────┼─────┼─────┼───────────┤  │
│  │ 🥇 │ Donat       │1250 │ 950 │10.000.000 │  │
│  │ 🥈 │ Roti Coklat │ 850 │ 720 │12.750.000 │  │
│  │ 🥉 │ Kue Lapis   │ 720 │ 650 │36.000.000 │  │
│  │ 4  │ Brownies    │ 650 │ 580 │19.500.000 │  │
│  └────┴─────────────┴─────┴─────┴───────────┘  │
│                                                  │
│  [📥 Export Excel] [📊 Lihat Grafik]           │
└─────────────────────────────────────────────────┘
```

**Fitur Tambahan**:
- Filter periode (dari - sampai)
- Sortir berdasarkan qty, transaksi, atau pendapatan
- Grafik batang untuk visualisasi
- Export data

---

## 🗂️ Struktur File

### Backend
```
backend/
├── routes/
│   └── rekap.js          # API routes untuk semua endpoint rekap
└── server.js             # Import dan daftarkan route rekap
```

### Frontend
```
frontend/
└── app/
    ├── rekap/
    │   ├── layout.js           # Layout wrapper untuk modul rekap
    │   ├── page.js             # Dashboard rekap (redirect/summary)
    │   ├── produksi/
    │   │   └── page.js         # Halaman rekap produksi
    │   ├── transaksi/
    │   │   └── page.js         # Halaman rekap transaksi
    │   └── terlaris/
    │       └── page.js         # Halaman produk terlaris
    └── api/
        └── rekap/
            ├── produksi/
            │   └── route.js    # API route produksi (jika pakai Next.js API)
            ├── transaksi/
            │   └── route.js    # API route transaksi
            └── terlaris/
                └── route.js    # API route terlaris
```

---

## 📝 Checklist Implementasi

### Backend
- [ ] Buat file `backend/routes/rekap.js`
- [ ] Implementasi endpoint `GET /api/rekap/produksi`
  - [ ] Query database berdasarkan tanggal
  - [ ] Grouping data per produk
  - [ ] Format response dengan jadwal
- [ ] Implementasi endpoint `GET /api/rekap/transaksi`
  - [ ] Query ringkasan pesanan per status
  - [ ] Query ringkasan keuangan
  - [ ] Combine hasil query
- [ ] Implementasi endpoint `GET /api/rekap/terlaris`
  - [ ] Query produk dengan total qty tertinggi
  - [ ] Filter berdasarkan periode
  - [ ] Limit hasil sesuai parameter
- [ ] Daftarkan route di `backend/server.js`
- [ ] Test semua endpoint dengan Postman/Thunder Client

### Frontend
- [ ] Buat layout wrapper `app/rekap/layout.js`
- [ ] Buat halaman dashboard rekap `app/rekap/page.js`
- [ ] **Rekap Produksi** (`app/rekap/produksi/page.js`)
  - [ ] Form filter tanggal
  - [ ] Fetch data dari API
  - [ ] Tampilkan tabel rekap dengan format jadwal
  - [ ] Hitung dan tampilkan total
  - [ ] Implementasi export Excel/CSV
  - [ ] Implementasi print layout
- [ ] **Rekap Transaksi** (`app/rekap/transaksi/page.js`)
  - [ ] Form filter tanggal
  - [ ] Fetch data dari API
  - [ ] Tampilkan card ringkasan pesanan
  - [ ] Tampilkan card ringkasan keuangan
  - [ ] Implementasi export Excel
- [ ] **Produk Terlaris** (`app/rekap/terlaris/page.js`)
  - [ ] Form filter periode (dari-sampai)
  - [ ] Fetch data dari API
  - [ ] Tampilkan tabel ranking produk
  - [ ] Tambahkan emoji medal (🥇🥈🥉)
  - [ ] Implementasi grafik batang (Chart.js/Recharts)
  - [ ] Implementasi export Excel
- [ ] **Navigasi**
  - [ ] Tambahkan menu Rekap di sidebar/navbar
  - [ ] Submenu: Produksi, Transaksi, Terlaris

### Testing
- [ ] Test filter tanggal di semua halaman
- [ ] Test data kosong (tidak ada pesanan)
- [ ] Test data dengan berbagai status pesanan
- [ ] Test export Excel/CSV
- [ ] Test print layout
- [ ] Test responsive design (mobile/tablet)

---

## 🎨 Styling Guidelines

### Color Scheme
```css
:root {
  --color-rekap-primary: #2563eb;      /* Blue untuk header */
  --color-rekap-success: #16a34a;      /* Green untuk success metrics */
  --color-rekap-warning: #f59e0b;      /* Orange untuk pending */
  --color-rekap-danger: #dc2626;       /* Red untuk cancelled */
  --color-rekap-info: #0ea5e9;         /* Cyan untuk info */
}
```

### Card Design
- Gunakan shadow untuk card elevation
- Border radius: 8px
- Padding: 24px
- Gunakan grid/flex untuk layout responsive

### Table Design
- Header dengan background tebal
- Zebra striping untuk readability
- Hover effect pada row
- Sticky header untuk table panjang

---

## 📦 Library yang Direkomendasikan

### Export Excel/CSV
```bash
npm install xlsx file-saver
```

**Implementasi**:
```javascript
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function exportToExcel(data, filename) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap');
  
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}.xlsx`);
}
```

### Grafik (Chart)
```bash
npm install recharts
```

**Komponen Chart**:
```javascript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

<BarChart width={600} height={300} data={chartData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="nama_produk" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Bar dataKey="total_qty" fill="#2563eb" />
</BarChart>
```

---

## 🔍 Validasi & Error Handling

### Validasi Input
- Tanggal tidak boleh kosong
- Tanggal "dari" tidak boleh lebih besar dari "sampai"
- Format tanggal harus valid (YYYY-MM-DD)

### Error Messages
```javascript
const ERROR_MESSAGES = {
  TANGGAL_REQUIRED: 'Tanggal harus diisi',
  TANGGAL_INVALID: 'Format tanggal tidak valid',
  PERIODE_INVALID: 'Tanggal akhir tidak boleh lebih kecil dari tanggal awal',
  NO_DATA: 'Tidak ada data untuk periode yang dipilih',
  FETCH_ERROR: 'Gagal mengambil data. Silakan coba lagi.'
};
```

### Loading State
- Tampilkan skeleton/spinner saat loading
- Disable button submit saat loading
- Timeout untuk request yang terlalu lama

---

## 🚀 Optimasi

### Database
- Index pada kolom `tanggal_pesan`, `tanggal_ambil`, `status`
- Gunakan prepared statement untuk query
- Cache hasil query yang sering diakses

### Frontend
- Lazy loading untuk komponen chart
- Debounce untuk filter input
- Pagination untuk data besar
- Memoization untuk perhitungan kompleks

---

## 📖 Referensi

### SQL Query untuk Rekap
Semua query sudah dijelaskan di section "Implementasi Backend"

### Format Data
Mengikuti struktur response API yang sudah didefinisikan

### UI/UX Inspiration
- **Rekap Produksi**: Mirip production schedule/work order
- **Rekap Transaksi**: Mirip dashboard sales report
- **Produk Terlaris**: Mirip leaderboard/ranking

---

## ✅ Kriteria Selesai

Modul 5 dianggap selesai jika:
1. ✅ Semua API endpoint berfungsi dengan baik
2. ✅ UI menampilkan data dengan benar
3. ✅ Filter tanggal/periode berfungsi
4. ✅ Export Excel/CSV berhasil
5. ✅ Print layout rapi dan readable
6. ✅ Responsive di mobile/tablet
7. ✅ Error handling berjalan baik
8. ✅ Loading state ditampilkan
9. ✅ Navigasi terintegrasi dengan modul lain
10. ✅ Testing berhasil untuk berbagai skenario

---

*Dokumen ini dibuat: 28 Januari 2026*  
*Versi: 1.0*  
*Status: Ready for Implementation*
