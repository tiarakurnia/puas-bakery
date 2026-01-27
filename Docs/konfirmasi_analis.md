# Konfirmasi Analisis Spesifikasi Aplikasi Kasir

> [!IMPORTANT]
> Mohon jawab semua pertanyaan di bawah ini agar spesifikasi aplikasi dapat dibuat secara lengkap dan akurat.

---

## A. Informasi Umum Aplikasi

| No | Pertanyaan | Jawaban |
|----|------------|---------|
| 1 | **Platform aplikasi**: Mobile (Android/iOS), Web, atau Desktop? | |
        Jawaban : Web
| 2 | **Nama toko** yang akan ditampilkan di struk kasir? | |
        Jawaban : Puas Bakery
| 3 | Apakah aplikasi **single user** atau **multi user** (butuh login/authentication)? | |
        Jawaban : Single User

---

## B. Master Data Produk

| No | Pertanyaan | Jawaban |
|----|------------|---------|
| 4 | **Satuan produk**: Apa saja pilihan satuan yang tersedia? (contoh: pcs, box, lusin, kg) | |
        Jawaban : pcs
| 5 | Apakah **stok** perlu dihitung otomatis berkurang saat ada pesanan baru? | |
        Jawaban : Tidak
| 6 | Apakah produk perlu dikelompokkan berdasarkan **kategori**? (misal: kue basah, kue kering, roti) | |
        Jawaban : Tidak

---

## C. Master Data Customer

| No | Pertanyaan | Jawaban |
|----|------------|---------|
| 7 | Apakah customer bisa melakukan pemesanan tanpa harus terdaftar (**walk-in / tanpa nama**)? | |
        Jawaban : Tidak
---

## D. Transaksi Pesanan

| No | Pertanyaan | Jawaban |
|----|------------|---------|
| 8 | **Status pesanan**: Apa saja status yang diperlukan? Contoh: Baru, Diproses, Siap Diambil, Selesai, Dibatalkan | |
        Jawaban : Baru, Diproses, Siap Diambil, Selesai, Dibatalkan
| 9 | **Minimal DP**: Berapa persentase atau nominal minimal DP yang diperbolehkan? | |
        Jawaban : 10%
| 10 | **Format nomor pesanan**: Contoh format? (INV-001, ORD-20260127-001, dll) | |
        Jawaban : ORD-20260127-001
| 11 | Apakah ada **diskon** per item atau per total transaksi? | |
        Jawaban : Tidak

---

## E. Cetak Nota

| No | Pertanyaan | Jawaban |
|----|------------|---------|
| 12 | **Informasi tambahan di struk**: Alamat toko? Nomor telepon? Ucapan terima kasih/footer? | |
        Jawaban : Alamat toko, Nomor telepon, Ucapan terima kasih
| 13 | Apakah struk perlu menampilkan **nama customer dan nomor HP**? | |
        Jawaban : Ya, dan alamat jangan lupa

---

## F. Rekap & Laporan

| No | Pertanyaan | Jawaban |
|----|------------|---------|
| 14 | Apakah perlu **export laporan** ke format tertentu? (Excel, PDF) | |
        Jawaban : Tidak, perlunya rekap pesanan untuk setiap harinya
| 15 | Apakah perlu laporan **per periode**? (mingguan, bulanan, selain harian) | |
        Jawaban : tidak
| 16 | Apakah perlu laporan **produk terlaris** atau **ringkasan per produk**? | |
        Jawaban : tidak

---

## G. Teknis

| No | Pertanyaan | Jawaban |
|----|------------|---------|
| 17 | **Database**: Ada preferensi database? (SQLite untuk offline, MySQL/PostgreSQL untuk online) | |
        Jawaban : Saranmu bagaimana?
| 18 | **Printer Bluetooth**: Merk/model printer spesifik yang akan digunakan? | |
        Jawaban : Printer Thermal 80MM Bluetooth + USB Cetak Resi Alamat Kasir Nota PPOB POS Barcode Support Kertas /android/ios/Windows
        Spesifikasi Printer : 
        - Thermal Line Printing
        - Print Speed :60-70mm/s
        - Lebar Cetakan : Max 78 mm ( 576 dot )
        - Lebar Kertas: 80 mm
        - Kapasitas baterai：2600mAh
        - Diameter Luar Kertas Thermal : Maks 40 mm
        - Charging Mode : DC 5V/1 A
        - Interface : USB 2.0 + Bluetooth 4.0
        - Language : Support for Multiple Language
        - Support : Windows
        - Warna : Hitam/Hutih 100km (kepadatan cetak di bawah 12.5%)/100 juta denyut
        - Dimensions : 122 x 104 x 61 mm (WxLxH)

---

> [!NOTE]
> Setelah semua pertanyaan dijawab, analisis akan dilanjutkan dan hasil perbaikan akan ditulis ke file output_modul.md.
