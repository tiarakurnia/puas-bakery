# Output Analisis Spesifikasi Aplikasi Kasir - Puas Bakery

> **Dokumen ini berisi spesifikasi teknis lengkap** hasil analisis dari `file_modul.csv` yang telah diperbaiki dan dilengkapi berdasarkan konfirmasi user.

---

## Ringkasan Informasi Aplikasi

| Parameter | Nilai |
|-----------|-------|
| **Nama Aplikasi** | Kasir Puas Bakery |
| **Platform** | Web |
| **Mode User** | Single User (tanpa login) |
| **Nama Toko** | Puas Bakery |
| **Database** | SQLite (via sql.js / IndexedDB) - Rekomendasi untuk web offline-first |
| **Printer** | Thermal 80mm Bluetooth + USB |

---

## Modul 1: Master Data Produk

### 1.1 Input Barang

| Field | Tipe Data | Wajib | Validasi |
|-------|-----------|-------|----------|
| `id` | INTEGER | Ya | Auto-increment, Primary Key |
| `nama_produk` | VARCHAR(100) | Ya | Unik, tidak boleh kosong |
| `harga` | DECIMAL(12,2) | Ya | Harus > 0 |
| `satuan` | VARCHAR(20) | Ya | Default: "pcs" |
| `created_at` | DATETIME | Ya | Auto-generate |
| `updated_at` | DATETIME | Ya | Auto-update |

> [!NOTE]
> Stok TIDAK dikelola (sesuai konfirmasi user).
> Kategori produk TIDAK diperlukan.

### 1.2 Edit Barang
- User dapat mengubah: `nama_produk`, `harga`, `satuan`
- Perubahan **tidak mempengaruhi** pesanan yang sudah tersimpan (harga di pesanan tetap sesuai saat transaksi)

### 1.3 Hapus Barang
- **Rule**: Produk tidak boleh dihapus jika sudah pernah digunakan di pesanan
- **Alternatif**: Gunakan soft delete dengan flag `is_active = false`

---

## Modul 2: Master Data Customer

### 2.1 Input Customer

| Field | Tipe Data | Wajib | Validasi |
|-------|-----------|-------|----------|
| `id` | INTEGER | Ya | Auto-increment, Primary Key |
| `nama` | VARCHAR(100) | Ya | Tidak boleh kosong |
| `no_hp` | VARCHAR(20) | Tidak | Format Indonesia: 08xx / +62xx |
| `alamat` | TEXT | Tidak | - |
| `email` | VARCHAR(100) | Tidak | Format email valid jika diisi |
| `created_at` | DATETIME | Ya | Auto-generate |
| `updated_at` | DATETIME | Ya | Auto-update |

> [!IMPORTANT]
> Customer **wajib terdaftar** untuk melakukan pesanan. Tidak ada mode walk-in/tanpa nama.

### 2.2 Edit Customer
- Semua field dapat diubah kecuali `id`

### 2.3 Hapus Customer
- **Rule**: Customer tidak boleh dihapus jika masih memiliki pesanan aktif (status bukan "Selesai" atau "Dibatalkan")

---

## Modul 3: Transaksi Pesanan

### 3.1 Status Pesanan

```
┌─────────┐    ┌───────────┐    ┌──────────────┐    ┌─────────┐
│  BARU   │───►│ DIPROSES  │───►│ SIAP DIAMBIL │───►│ SELESAI │
└─────────┘    └───────────┘    └──────────────┘    └─────────┘
      │                                                   
      └──────────────────────────────────────────────────►┌───────────┐
                                                          │ DIBATALKAN│
                                                          └───────────┘
```

### 3.2 Input Pesanan

#### Header Pesanan

| Field | Tipe Data | Wajib | Validasi |
|-------|-----------|-------|----------|
| `id` | INTEGER | Ya | Auto-increment, Primary Key |
| `nomor_pesanan` | VARCHAR(30) | Ya | Format: `ORD-YYYYMMDD-XXX` (auto-generate) |
| `customer_id` | INTEGER | Ya | Foreign Key ke tabel customer |
| `tanggal_pesan` | DATE | Ya | Default: tanggal hari ini |
| `tanggal_ambil` | DATE | Ya | >= tanggal hari ini |
| `jam_ambil` | TIME | Ya | Format: HH:MM |
| `status` | ENUM | Ya | Default: "BARU" |
| `jenis_bayar` | ENUM | Ya | "DP" atau "LUNAS" |
| `total` | DECIMAL(12,2) | Ya | Calculated field |
| `dp` | DECIMAL(12,2) | Ya | Default: 0 |
| `sisa_bayar` | DECIMAL(12,2) | Ya | Calculated: total - dp |
| `created_at` | DATETIME | Ya | Auto-generate |
| `updated_at` | DATETIME | Ya | Auto-update |

#### Detail Pesanan (Item)

| Field | Tipe Data | Wajib | Validasi |
|-------|-----------|-------|----------|
| `id` | INTEGER | Ya | Auto-increment, Primary Key |
| `pesanan_id` | INTEGER | Ya | Foreign Key ke tabel pesanan |
| `produk_id` | INTEGER | Ya | Foreign Key ke tabel produk |
| `nama_produk` | VARCHAR(100) | Ya | Snapshot nama produk saat transaksi |
| `harga` | DECIMAL(12,2) | Ya | Snapshot harga saat transaksi |
| `qty` | INTEGER | Ya | Minimal 1 |
| `subtotal` | DECIMAL(12,2) | Ya | Calculated: qty × harga |

### 3.3 Format Nomor Pesanan

```
ORD-YYYYMMDD-XXX

Contoh: ORD-20260127-001, ORD-20260127-002, dst.

- ORD = Prefix tetap
- YYYYMMDD = Tanggal pembuatan pesanan
- XXX = Nomor urut harian (reset setiap hari mulai dari 001)
```

### 3.4 Rule Pembayaran

| Jenis Bayar | Validasi DP | Sisa Bayar |
|-------------|-------------|------------|
| **DP** | Minimal 10% dari total | total - dp |
| **LUNAS** | dp = total (otomatis) | 0 |

### 3.5 Edit Pesanan
- **Boleh diedit** jika status: BARU, DIPROSES
- **Tidak boleh diedit** jika status: SIAP DIAMBIL, SELESAI, DIBATALKAN

### 3.6 Hapus Pesanan
- **Boleh dihapus** jika status: BARU dan belum pernah dicetak
- Pertimbangkan menggunakan status DIBATALKAN sebagai alternatif hapus

---

## Modul 4: Cetak Nota

### 4.1 Format Struk (Printer Thermal 80mm)

```
================================================
              PUAS BAKERY
     [Alamat Toko - Konfigurasi]
        Telp: [No. Telepon Toko]
================================================
No: ORD-20260127-001
Tgl: 27-01-2026  Jam Ambil: 14:00
------------------------------------------------
Customer : [Nama Customer]
HP       : [No HP Customer]
Alamat   : [Alamat Customer]
------------------------------------------------
Item                    Qty    Harga    Subtotal
------------------------------------------------
Roti Coklat               5   15.000     75.000
Donat Gula               10    8.000     80.000
Kue Lapis                 2   50.000    100.000
------------------------------------------------
TOTAL                              Rp   255.000
DP                                 Rp    25.500
SISA BAYAR                         Rp   229.500
================================================
      Terima Kasih Atas Pesanannya!
          ~ Puas Bakery ~
================================================
```

### 4.2 Konfigurasi Toko (Perlu Disimpan)

| Parameter | Nilai Default |
|-----------|---------------|
| `nama_toko` | Puas Bakery |
| `alamat_toko` | [Perlu diisi user] |
| `telepon_toko` | [Perlu diisi user] |
| `footer_struk` | "Terima Kasih Atas Pesanannya!" |

### 4.3 Spesifikasi Printer

| Spesifikasi | Nilai |
|-------------|-------|
| Tipe | Thermal Line Printing |
| Lebar Kertas | 80mm |
| Lebar Cetak | Max 78mm (576 dot) |
| Interface | USB 2.0 + Bluetooth 4.0 |
| Platform | Windows, Android, iOS |

> [!TIP]
> Untuk koneksi **Web ↔ Printer Bluetooth**, gunakan **Web Bluetooth API** atau **WebUSB API**. Alternatif: generate PDF struk yang bisa dicetak manual.

---

## Modul 5: Rekap & Laporan

> [!TIP]
> 📄 **Dokumentasi Lengkap**: Lihat [modul_5_rekap_laporan.md](file:///e:/Kasir/Docs/modul_5_rekap_laporan.md) untuk spesifikasi implementasi detail, API endpoints, dan UI mockups.

### 5.1 Tujuan Rekap Harian

Rekap harian bertujuan untuk mengetahui **produk apa saja** yang harus disiapkan pada hari tersebut, beserta **jumlah** dan **jam pengambilan** masing-masing.

> [!NOTE]
> Format rekap: **1 produk = 1 baris**, menampilkan semua jadwal pengambilan secara horizontal.

### 5.2 Data Rekap Harian

| Field | Keterangan |
|-------|------------|
| Tanggal Ambil | Filter berdasarkan tanggal pengambilan (wajib) |
| Nama Produk | Nama kue/produk |
| Jadwal | Daftar qty + jam ambil (digabung dalam 1 baris) |

### 5.3 Tampilan Rekap

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

### 5.4 Query SQL untuk Rekap

```sql
-- Rekap produk dengan jadwal (untuk diproses di aplikasi)
SELECT 
    pd.nama_produk,
    p.jam_ambil,
    SUM(pd.qty) AS total_qty
FROM pesanan p
JOIN pesanan_detail pd ON p.id = pd.pesanan_id
WHERE p.tanggal_ambil = :tanggal_filter
  AND p.status NOT IN ('DIBATALKAN')
GROUP BY pd.nama_produk, p.jam_ambil
ORDER BY pd.nama_produk, p.jam_ambil;

-- Catatan: Aplikasi akan menggabungkan hasil query ini
-- menjadi format "qty@jam • qty@jam" per produk
```

---

## Rekomendasi Database

> [!IMPORTANT]
> **Rekomendasi: SQLite via sql.js + IndexedDB**

### Alasan:
1. **Aplikasi Web Single User** → tidak butuh database server
2. **Offline-first** → data tersimpan di browser
3. **Portable** → bisa export/backup file database
4. **Mudah migrasi** → jika nanti butuh server, migrasi ke PostgreSQL/MySQL relatif mudah

### Alternatif:
- **Dexie.js** (IndexedDB wrapper) - lebih ringan
- **PouchDB** - jika butuh sync ke server di masa depan

---

## Struktur Database (SQL)

```sql
-- Tabel Produk
CREATE TABLE produk (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_produk VARCHAR(100) NOT NULL UNIQUE,
    harga DECIMAL(12,2) NOT NULL CHECK (harga > 0),
    satuan VARCHAR(20) NOT NULL DEFAULT 'pcs',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Customer
CREATE TABLE customer (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama VARCHAR(100) NOT NULL,
    no_hp VARCHAR(20),
    alamat TEXT,
    email VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Pesanan (Header)
CREATE TABLE pesanan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nomor_pesanan VARCHAR(30) NOT NULL UNIQUE,
    customer_id INTEGER NOT NULL,
    tanggal_pesan DATE NOT NULL,
    tanggal_ambil DATE NOT NULL,
    jam_ambil TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'BARU',
    jenis_bayar VARCHAR(10) NOT NULL,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    dp DECIMAL(12,2) NOT NULL DEFAULT 0,
    sisa_bayar DECIMAL(12,2) NOT NULL DEFAULT 0,
    sudah_cetak BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(id),
    CHECK (status IN ('BARU', 'DIPROSES', 'SIAP DIAMBIL', 'SELESAI', 'DIBATALKAN')),
    CHECK (jenis_bayar IN ('DP', 'LUNAS')),
    CHECK (tanggal_ambil >= tanggal_pesan)
);

-- Tabel Detail Pesanan (Item)
CREATE TABLE pesanan_detail (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pesanan_id INTEGER NOT NULL,
    produk_id INTEGER NOT NULL,
    nama_produk VARCHAR(100) NOT NULL,
    harga DECIMAL(12,2) NOT NULL,
    qty INTEGER NOT NULL CHECK (qty >= 1),
    subtotal DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (pesanan_id) REFERENCES pesanan(id) ON DELETE CASCADE,
    FOREIGN KEY (produk_id) REFERENCES produk(id)
);

-- Tabel Konfigurasi Toko
CREATE TABLE konfigurasi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_toko VARCHAR(100) NOT NULL DEFAULT 'Puas Bakery',
    alamat_toko TEXT,
    telepon_toko VARCHAR(20),
    footer_struk VARCHAR(200) DEFAULT 'Terima Kasih Atas Pesanannya!'
);

-- Insert default konfigurasi
INSERT INTO konfigurasi (nama_toko) VALUES ('Puas Bakery');
```

---

## Catatan Teknis Tambahan

### Web Bluetooth untuk Printer
- Gunakan **Web Bluetooth API** untuk koneksi printer thermal
- Browser yang didukung: Chrome, Edge (desktop & mobile)
- Fallback: Generate struk sebagai PDF untuk print manual

### Pertanyaan Pendahuluan yang Perlu Dijawab User

> [!CAUTION]
> Sebelum development, mohon lengkapi informasi berikut:

| No | Informasi | Status |
|----|-----------|--------|
| 1 | Alamat lengkap toko untuk struk | **Belum diisi** |
| 2 | Nomor telepon toko untuk struk | **Belum diisi** |

---

## Kesimpulan

Dokumen ini merupakan spesifikasi teknis lengkap untuk **Aplikasi Kasir Puas Bakery** berbasis web. Spesifikasi ini siap digunakan sebagai panduan pengembangan dengan struktur:

1. **5 Modul Utama**: Master Produk, Master Customer, Transaksi Pesanan, Cetak Nota, Rekap Laporan
2. **Database**: SQLite via sql.js (rekomendasi untuk web offline-first)
3. **Printer**: Thermal 80mm via Web Bluetooth/USB
4. **Platform**: Web (HTML, CSS, JavaScript)

---

*Dokumen dihasilkan: 27 Januari 2026*
*Analyst: AI System Analyst*
