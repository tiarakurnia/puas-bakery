-- Inisialisasi Database MySQL untuk Kasir Puas Bakery

-- Tabel Produk
CREATE TABLE IF NOT EXISTS produk (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_produk VARCHAR(100) NOT NULL UNIQUE,
    harga DECIMAL(12,2) NOT NULL CHECK (harga > 0),
    satuan VARCHAR(20) NOT NULL DEFAULT 'pcs',
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel Customer
CREATE TABLE IF NOT EXISTS customer (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    no_hp VARCHAR(20),
    alamat TEXT,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel Pesanan (Header)
CREATE TABLE IF NOT EXISTS pesanan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nomor_pesanan VARCHAR(30) NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    tanggal_pesan DATE NOT NULL,
    tanggal_ambil DATE NOT NULL,
    jam_ambil TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'BARU',
    jenis_bayar VARCHAR(10) NOT NULL,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    dp DECIMAL(12,2) NOT NULL DEFAULT 0,
    sisa_bayar DECIMAL(12,2) NOT NULL DEFAULT 0,
    sudah_cetak BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(id)
);

-- Tabel Detail Pesanan (Item)
CREATE TABLE IF NOT EXISTS pesanan_detail (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pesanan_id INT NOT NULL,
    produk_id INT NOT NULL,
    nama_produk VARCHAR(100) NOT NULL,
    harga DECIMAL(12,2) NOT NULL,
    qty INT NOT NULL CHECK (qty >= 1),
    subtotal DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (pesanan_id) REFERENCES pesanan(id) ON DELETE CASCADE,
    FOREIGN KEY (produk_id) REFERENCES produk(id)
);

-- Tabel Konfigurasi Toko
CREATE TABLE IF NOT EXISTS konfigurasi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_toko VARCHAR(100) NOT NULL DEFAULT 'Puas Bakery',
    alamat_toko TEXT,
    telepon_toko VARCHAR(20),
    footer_struk VARCHAR(200) DEFAULT 'Terima Kasih Atas Pesanannya!'
);

-- Insert Default Konfigurasi (jika belum ada)
INSERT IGNORE INTO konfigurasi (id, nama_toko, alamat_toko, telepon_toko) 
VALUES (1, 'Puas Bakery', 'Tambak Beras Gg 1 No 2, Kec. Jombang, Kab. Jombang', '085331277898');
