/**
 * Konfigurasi Database SQLite
 * File ini berisi setup koneksi dan inisialisasi tabel database
 */

const Database = require('better-sqlite3');
const path = require('path');

// Path file database
const dbPath = path.join(__dirname, '..', 'data', 'kasir.db');

// Buat koneksi database
const db = new Database(dbPath);

// Aktifkan foreign keys
db.pragma('foreign_keys = ON');

/**
 * Inisialisasi semua tabel yang dibutuhkan
 */
function initDatabase() {
    // Tabel Produk
    db.exec(`
        CREATE TABLE IF NOT EXISTS produk (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nama_produk VARCHAR(100) NOT NULL UNIQUE,
            harga DECIMAL(12,2) NOT NULL CHECK (harga > 0),
            satuan VARCHAR(20) NOT NULL DEFAULT 'pcs',
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Tabel Customer
    db.exec(`
        CREATE TABLE IF NOT EXISTS customer (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nama VARCHAR(100) NOT NULL,
            no_hp VARCHAR(20),
            alamat TEXT,
            email VARCHAR(100),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Tabel Pesanan (Header)
    db.exec(`
        CREATE TABLE IF NOT EXISTS pesanan (
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
            sudah_cetak BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES customer(id)
        )
    `);

    // Tabel Detail Pesanan (Item)
    db.exec(`
        CREATE TABLE IF NOT EXISTS pesanan_detail (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pesanan_id INTEGER NOT NULL,
            produk_id INTEGER NOT NULL,
            nama_produk VARCHAR(100) NOT NULL,
            harga DECIMAL(12,2) NOT NULL,
            qty INTEGER NOT NULL CHECK (qty >= 1),
            subtotal DECIMAL(12,2) NOT NULL,
            FOREIGN KEY (pesanan_id) REFERENCES pesanan(id) ON DELETE CASCADE,
            FOREIGN KEY (produk_id) REFERENCES produk(id)
        )
    `);

    // Tabel Konfigurasi Toko
    db.exec(`
        CREATE TABLE IF NOT EXISTS konfigurasi (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nama_toko VARCHAR(100) NOT NULL DEFAULT 'Puas Bakery',
            alamat_toko TEXT,
            telepon_toko VARCHAR(20),
            footer_struk VARCHAR(200) DEFAULT 'Terima Kasih Atas Pesanannya!'
        )
    `);

    // Cek apakah konfigurasi sudah ada
    const konfig = db.prepare('SELECT COUNT(*) as count FROM konfigurasi').get();
    if (konfig.count === 0) {
        // Insert konfigurasi default
        db.prepare(`
            INSERT INTO konfigurasi (nama_toko, alamat_toko, telepon_toko) 
            VALUES (?, ?, ?)
        `).run('Puas Bakery', 'Tambak Beras Gg 1 No 2, Kec. Jombang, Kab. Jombang', '085331277898');
    }

    console.log('Database berhasil diinisialisasi');
}

// Jalankan inisialisasi
initDatabase();

module.exports = db;
