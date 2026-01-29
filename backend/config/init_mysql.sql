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
    catatan TEXT,
    tag VARCHAR(50),
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

-- Tabel Jam Operasional
CREATE TABLE IF NOT EXISTS jam_operasional (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hari ENUM('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu') NOT NULL UNIQUE,
    jam_buka TIME NOT NULL,
    jam_tutup TIME NOT NULL,
    is_buka BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel Slot Waktu Pickup
CREATE TABLE IF NOT EXISTS slot_waktu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    waktu TIME NOT NULL UNIQUE,
    is_aktif BOOLEAN DEFAULT 1
);

-- Tabel Tanggal Libur
CREATE TABLE IF NOT EXISTS tanggal_libur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tanggal DATE NOT NULL UNIQUE,
    keterangan VARCHAR(100)
);

-- Tabel History Pembayaran
CREATE TABLE IF NOT EXISTS history_pembayaran (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pesanan_id INT NOT NULL,
    nominal DECIMAL(12,2) NOT NULL,
    keterangan VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pesanan_id) REFERENCES pesanan(id) ON DELETE CASCADE
);

-- Insert Jam Operasional Default (Senin-Minggu)
INSERT IGNORE INTO jam_operasional (hari, jam_buka, jam_tutup, is_buka) VALUES
('Senin', '07:00:00', '18:00:00', 1),
('Selasa', '07:00:00', '18:00:00', 1),
('Rabu', '07:00:00', '18:00:00', 1),
('Kamis', '07:00:00', '18:00:00', 1),
('Jumat', '07:00:00', '18:00:00', 1),
('Sabtu', '07:00:00', '18:00:00', 1),
('Minggu', '08:00:00', '14:00:00', 0);

-- Insert Slot Waktu Default (setiap 30 menit dari 07:00 - 18:00)
INSERT IGNORE INTO slot_waktu (waktu) VALUES
('07:00:00'), ('07:30:00'), ('08:00:00'), ('08:30:00'),
('09:00:00'), ('09:30:00'), ('10:00:00'), ('10:30:00'),
('11:00:00'), ('11:30:00'), ('12:00:00'), ('12:30:00'),
('13:00:00'), ('13:30:00'), ('14:00:00'), ('14:30:00'),
('15:00:00'), ('15:30:00'), ('16:00:00'), ('16:30:00'),
('17:00:00'), ('17:30:00'), ('18:00:00');

