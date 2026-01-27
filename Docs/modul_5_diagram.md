# Diagram & Visualisasi - Modul 5

> Diagram visual untuk memudahkan pemahaman arsitektur dan flow Modul 5

---

## 🏗️ Arsitektur Modul 5

```mermaid
graph TB
    subgraph Frontend["🎨 Frontend (Next.js)"]
        UI1[📄 Rekap Produksi<br/>app/rekap/produksi]
        UI2[📄 Rekap Transaksi<br/>app/rekap/transaksi]
        UI3[📄 Produk Terlaris<br/>app/rekap/terlaris]
    end
    
    subgraph Backend["⚙️ Backend API"]
        API1[GET /api/rekap/produksi]
        API2[GET /api/rekap/transaksi]
        API3[GET /api/rekap/terlaris]
    end
    
    subgraph Database["🗄️ MySQL Database"]
        T1[(Tabel pesanan)]
        T2[(Tabel pesanan_detail)]
        T3[(Tabel produk)]
    end
    
    UI1 -->|fetch data| API1
    UI2 -->|fetch data| API2
    UI3 -->|fetch data| API3
    
    API1 -->|query| T1
    API1 -->|join| T2
    
    API2 -->|query| T1
    
    API3 -->|query| T2
    API3 -->|join| T1
```

---

## 📊 Data Flow: Rekap Produksi

```mermaid
sequenceDiagram
    actor User
    participant UI as Frontend UI
    participant API as Backend API
    participant DB as Database
    
    User->>UI: Pilih tanggal: 2026-01-28
    User->>UI: Klik "Lihat Rekap"
    
    UI->>API: GET /api/rekap/produksi?tanggal=2026-01-28
    
    API->>DB: SELECT produk, jam, qty<br/>WHERE tanggal_ambil = '2026-01-28'<br/>GROUP BY produk, jam
    
    DB-->>API: Raw data:<br/>[{Donat,07:00,50}, {Donat,15:00,30}, ...]
    
    API->>API: Format jadwal:<br/>Group by produk
    
    API-->>UI: JSON Response:<br/>{Donat: [{jam:07:00,qty:50}, {jam:15:00,qty:30}], ...}
    
    UI->>UI: Render tabel:<br/>Donat | 50pcs @07:00 • 30pcs @15:00
    
    UI-->>User: Tampilkan rekap
    
    User->>UI: Klik "Export Excel"
    UI->>UI: Generate XLSX
    UI-->>User: Download file
```

---

## 🔄 Data Transformation: Rekap Produksi

### Input: Query Result dari Database

```json
[
  { "nama_produk": "Donat", "jam_ambil": "07:00", "total_qty": 50 },
  { "nama_produk": "Donat", "jam_ambil": "15:00", "total_qty": 30 },
  { "nama_produk": "Donat", "jam_ambil": "17:00", "total_qty": 40 },
  { "nama_produk": "Roti Coklat", "jam_ambil": "07:00", "total_qty": 20 },
  { "nama_produk": "Roti Coklat", "jam_ambil": "10:00", "total_qty": 15 }
]
```

### Transformasi di Backend

```javascript
// Grouping by nama_produk
const grouped = {};

queryResults.forEach(row => {
  if (!grouped[row.nama_produk]) {
    grouped[row.nama_produk] = {
      nama_produk: row.nama_produk,
      jadwal: [],
      total_qty: 0
    };
  }
  
  grouped[row.nama_produk].jadwal.push({
    jam: row.jam_ambil,
    qty: row.total_qty
  });
  
  grouped[row.nama_produk].total_qty += row.total_qty;
});

const result = Object.values(grouped);
```

### Output: Response API

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

### Display di Frontend

```
┌───────────────┬─────────────────────────────────────────────────┐
│ Produk        │ Jadwal (qty @jam)                               │
├───────────────┼─────────────────────────────────────────────────┤
│ Donat         │ 50pcs @07:00 • 30pcs @15:00 • 40pcs @17:00      │
│ Roti Coklat   │ 20pcs @07:00 • 15pcs @10:00                     │
└───────────────┴─────────────────────────────────────────────────┘
Total: 2 produk, 155 pcs
```

---

## 📈 Database Schema untuk Modul 5

```mermaid
erDiagram
    PESANAN ||--o{ PESANAN_DETAIL : contains
    PESANAN }o--|| CUSTOMER : "ordered by"
    PESANAN_DETAIL }o--|| PRODUK : references
    
    PESANAN {
        int id PK
        string nomor_pesanan
        int customer_id FK
        date tanggal_pesan
        date tanggal_ambil
        time jam_ambil
        string status
        string jenis_bayar
        decimal total
        decimal dp
        decimal sisa_bayar
    }
    
    PESANAN_DETAIL {
        int id PK
        int pesanan_id FK
        int produk_id FK
        string nama_produk
        decimal harga
        int qty
        decimal subtotal
    }
    
    PRODUK {
        int id PK
        string nama_produk
        decimal harga
        string satuan
    }
    
    CUSTOMER {
        int id PK
        string nama
        string no_hp
    }
```

**Catatan**:
- Modul 5 fokus pada tabel `PESANAN` dan `PESANAN_DETAIL`
- Field `nama_produk` di `PESANAN_DETAIL` adalah **snapshot** saat transaksi
- Filter berdasarkan `status != 'DIBATALKAN'`

---

## 🎯 Flow Chart: Implementasi Step-by-Step

```mermaid
graph TD
    Start([Mulai Implementasi<br/>Modul 5]) --> Install[Install Dependencies<br/>xlsx, file-saver, recharts]
    
    Install --> Backend1[Backend: Setup Route<br/>routes/rekap.js]
    
    Backend1 --> Backend2{Endpoint mana<br/>yang dikerjakan?}
    
    Backend2 -->|Prioritas 1| B2A[Implementasi<br/>/api/rekap/produksi]
    Backend2 -->|Prioritas 2| B2B[Implementasi<br/>/api/rekap/transaksi]
    Backend2 -->|Prioritas 3| B2C[Implementasi<br/>/api/rekap/terlaris]
    
    B2A --> TestAPI1[Test API<br/>dengan Postman]
    B2B --> TestAPI2[Test API<br/>dengan Postman]
    B2C --> TestAPI3[Test API<br/>dengan Postman]
    
    TestAPI1 --> Frontend1[Frontend: Buat Layout<br/>app/rekap/layout.js]
    TestAPI2 --> Frontend1
    TestAPI3 --> Frontend1
    
    Frontend1 --> Frontend2{Halaman mana<br/>yang dikerjakan?}
    
    Frontend2 -->|Prioritas 1| F2A[Halaman<br/>Rekap Produksi]
    Frontend2 -->|Prioritas 2| F2B[Halaman<br/>Rekap Transaksi]
    Frontend2 -->|Prioritas 3| F2C[Halaman<br/>Produk Terlaris]
    
    F2A --> TestUI1[Test UI<br/>+ Export Excel]
    F2B --> TestUI2[Test UI<br/>+ Export Excel]
    F2C --> TestUI3[Test UI<br/>+ Chart + Export]
    
    TestUI1 --> Integration[Integration Test<br/>End-to-End]
    TestUI2 --> Integration
    TestUI3 --> Integration
    
    Integration --> UAT[User Acceptance<br/>Testing]
    
    UAT --> Done([Modul 5 Selesai!<br/>✅])
    
    style Start fill:#2563eb,color:#fff
    style Done fill:#16a34a,color:#fff
    style B2A fill:#f59e0b,color:#000
    style F2A fill:#f59e0b,color:#000
```

---

## 🗺️ Navigation Map

```mermaid
graph LR
    Dashboard[🏠 Dashboard] --> Produk[📦 Produk]
    Dashboard --> Customer[👥 Customer]
    Dashboard --> Transaksi[🛒 Transaksi]
    Dashboard --> Nota[🧾 Nota]
    Dashboard --> Rekap[📊 Rekap]
    
    Rekap --> RProduksi[🎂 Rekap Produksi]
    Rekap --> RTransaksi[💰 Rekap Transaksi]
    Rekap --> RTerlaris[🏆 Produk Terlaris]
    
    style Rekap fill:#2563eb,color:#fff
    style RProduksi fill:#0ea5e9,color:#fff
    style RTransaksi fill:#0ea5e9,color:#fff
    style RTerlaris fill:#0ea5e9,color:#fff
```

---

## 📊 Contoh Data: Rekap Transaksi

### Input: Database Records
```
pesanan table:
+----+------------------+-----------+--------+-----------+
| id | nomor_pesanan    | status    | jenis  | total     |
+----+------------------+-----------+--------+-----------+
| 1  | ORD-20260128-001 | SELESAI   | LUNAS  | 150000    |
| 2  | ORD-20260128-002 | DIPROSES  | DP     | 200000    |
| 3  | ORD-20260128-003 | BARU      | DP     | 180000    |
| 4  | ORD-20260128-004 | DIBATALKAN| DP     | 100000    |
+----+------------------+-----------+--------+-----------+
```

### Processing Logic
```javascript
// Count per status
const statusCounts = {
  BARU: 1,
  DIPROSES: 1,
  SELESAI: 1,
  DIBATALKAN: 1  // Excluded from financial calculation
};

// Financial summary (exclude DIBATALKAN)
const total_transaksi = 150000 + 200000 + 180000 = 530000;
const total_lunas = 150000;
const total_dp = (200000 * 0.5) + (180000 * 0.5) = 190000; // Assume 50% DP
const sisa_tagihan = 530000 - 150000 - 190000 = 190000;
```

### Output: API Response
```json
{
  "success": true,
  "tanggal": "2026-01-28",
  "data": {
    "total_pesanan": 4,
    "pesanan_baru": 1,
    "pesanan_diproses": 1,
    "pesanan_siap": 0,
    "pesanan_selesai": 1,
    "pesanan_batal": 1,
    "total_transaksi": 530000,
    "total_dp": 190000,
    "total_lunas": 150000,
    "sisa_tagihan": 190000
  }
}
```

---

## 🎨 UI Component Structure

### Rekap Produksi Page

```
RekapProduksiPage
├── Header
│   └── Title: "🎂 Rekap Produksi Harian"
├── FilterSection
│   ├── DatePicker (tanggal)
│   └── Button "Lihat Rekap"
├── SummaryCards
│   ├── Card: Total Produk
│   └── Card: Total Qty
├── DataTable
│   ├── TableHeader
│   │   ├── Column: "Produk"
│   │   └── Column: "Jadwal (qty @jam)"
│   └── TableBody
│       └── TableRow (foreach product)
│           ├── Cell: nama_produk
│           └── Cell: formatted_jadwal
├── ActionButtons
│   ├── Button "Export Excel"
│   └── Button "Cetak"
└── LoadingState / EmptyState / ErrorState
```

---

## 🔍 SQL Query Visualization

### Query: Rekap Produksi

```sql
SELECT 
    pd.nama_produk,      -- Nama produk
    p.jam_ambil,         -- Jam pengambilan
    SUM(pd.qty) AS qty   -- Total qty untuk jam tersebut
FROM pesanan p
JOIN pesanan_detail pd ON p.id = pd.pesanan_id
WHERE p.tanggal_ambil = '2026-01-28'
  AND p.status != 'DIBATALKAN'
GROUP BY pd.nama_produk, p.jam_ambil
ORDER BY pd.nama_produk, p.jam_ambil;
```

**Visualisasi Hasil Query**:
```
┌─────────────┬───────────┬─────┐
│ nama_produk │ jam_ambil │ qty │
├─────────────┼───────────┼─────┤
│ Donat       │ 07:00     │ 50  │
│ Donat       │ 15:00     │ 30  │
│ Donat       │ 17:00     │ 40  │
│ Roti Coklat │ 07:00     │ 20  │
│ Roti Coklat │ 10:00     │ 15  │
└─────────────┴───────────┴─────┘
```

**Setelah Transformasi Backend** → Format jadwal horizontal:
```
┌─────────────┬──────────────────────────────────────┐
│ nama_produk │ jadwal                               │
├─────────────┼──────────────────────────────────────┤
│ Donat       │ 50pcs @07:00 • 30pcs @15:00 • ...   │
│ Roti Coklat │ 20pcs @07:00 • 15pcs @10:00          │
└─────────────┴──────────────────────────────────────┘
```

---

## 📦 File Structure Tree

```
e:\Kasir\
├── backend\
│   ├── routes\
│   │   ├── produk.js
│   │   ├── customer.js
│   │   ├── transaksi.js
│   │   └── rekap.js          ← NEW (Modul 5)
│   └── server.js             ← UPDATE (register /api/rekap)
│
├── frontend\
│   └── app\
│       ├── produk\
│       ├── customer\
│       ├── transaksi\
│       ├── nota\
│       └── rekap\            ← NEW (Modul 5)
│           ├── layout.js
│           ├── page.js
│           ├── produksi\
│           │   └── page.js
│           ├── transaksi\
│           │   └── page.js
│           └── terlaris\
│               └── page.js
│
└── Docs\
    ├── output_modul.md       ← EXISTING
    ├── modul_5_rekap_laporan.md    ← NEW
    ├── modul_5_quick_start.md      ← NEW
    └── modul_5_diagram.md          ← THIS FILE
```

---

## 🧪 Testing Flow Diagram

```mermaid
graph TD
    Test([Start Testing]) --> Unit[Unit Test<br/>Backend API]
    
    Unit --> U1{API Test<br/>Passed?}
    U1 -->|No| Fix1[Debug & Fix]
    Fix1 --> Unit
    U1 -->|Yes| Frontend[Frontend UI Test]
    
    Frontend --> F1{UI Test<br/>Passed?}
    F1 -->|No| Fix2[Debug & Fix]
    Fix2 --> Frontend
    F1 -->|Yes| Integration[Integration Test<br/>UI ↔ API ↔ DB]
    
    Integration --> I1{Integration<br/>Passed?}
    I1 -->|No| Fix3[Debug & Fix]
    Fix3 --> Integration
    I1 -->|Yes| Edge[Edge Case Testing]
    
    Edge --> E1{Edge Cases<br/>Handled?}
    E1 -->|No| Fix4[Add Error Handling]
    Fix4 --> Edge
    E1 -->|Yes| UAT[User Acceptance<br/>Testing]
    
    UAT --> Final{User<br/>Approved?}
    Final -->|No| Iterate[Iterate Based<br/>on Feedback]
    Iterate --> Frontend
    Final -->|Yes| Done([Testing Complete!])
    
    style Test fill:#2563eb,color:#fff
    style Done fill:#16a34a,color:#fff
    style Fix1 fill:#dc2626,color:#fff
    style Fix2 fill:#dc2626,color:#fff
    style Fix3 fill:#dc2626,color:#fff
    style Fix4 fill:#dc2626,color:#fff
```

---

## 💾 Export Excel Flow

```mermaid
sequenceDiagram
    actor User
    participant UI
    participant XLSX
    participant FileSaver
    participant Browser
    
    User->>UI: Klik "Export Excel"
    
    UI->>UI: Validasi data ada?
    
    alt Data kosong
        UI-->>User: Alert: "Tidak ada data"
    else Data ada
        UI->>XLSX: utils.json_to_sheet(data)
        XLSX-->>UI: Worksheet object
        
        UI->>XLSX: utils.book_new()
        XLSX-->>UI: Workbook object
        
        UI->>XLSX: utils.book_append_sheet(wb, ws)
        
        UI->>XLSX: write(wb, {type:'array'})
        XLSX-->>UI: Buffer
        
        UI->>FileSaver: new Blob(buffer)
        FileSaver-->>UI: Blob object
        
        UI->>FileSaver: saveAs(blob, filename)
        FileSaver->>Browser: Trigger download
        
        Browser-->>User: File downloaded!
    end
```

---

## 📱 Responsive Design Breakpoints

```mermaid
graph LR
    Mobile[📱 Mobile<br/>320px - 767px] --> Tablet[📱 Tablet<br/>768px - 1023px]
    Tablet --> Desktop[🖥️ Desktop<br/>1024px+]
    
    style Mobile fill:#f59e0b,color:#000
    style Tablet fill:#2563eb,color:#fff
    style Desktop fill:#16a34a,color:#fff
```

### Layout Adjustments

**Mobile (< 768px)**:
- Stack cards vertically
- Horizontal scroll for wide tables
- Collapse navigation to hamburger menu
- Single column layout

**Tablet (768px - 1023px)**:
- 2-column grid for cards
- Table with reduced padding
- Visible navigation

**Desktop (1024px+)**:
- 3-4 column grid for cards
- Full-width tables
- Sidebar navigation
- Chart in larger size

---

## 🚀 Performance Optimization

```mermaid
graph TD
    Query[Database Query] --> Index{Indexed<br/>Columns?}
    
    Index -->|No| AddIndex[Add Index:<br/>tanggal_pesan<br/>tanggal_ambil<br/>status]
    Index -->|Yes| Fast[Fast Query]
    
    AddIndex --> Fast
    
    Fast --> Cache{Cache<br/>Results?}
    
    Cache -->|Yes| CacheHit[Return from Cache]
    Cache -->|No| FreshData[Query Database]
    
    FreshData --> Response[API Response]
    CacheHit --> Response
    
    Response --> FrontendOpt[Frontend Optimization]
    
    FrontendOpt --> Lazy[Lazy Load Charts]
    FrontendOpt --> Memo[Memoize Calculations]
    FrontendOpt --> Debounce[Debounce Filter Input]
    
    style AddIndex fill:#f59e0b,color:#000
    style Fast fill:#16a34a,color:#fff
```

---

## 📊 Chart Example: Produk Terlaris

### Bar Chart Visualization

```
Produk Terlaris (Januari 2026)

Qty Terjual
    │
1250│     █████
    │     █████
1000│     █████
    │     █████      █████
 750│     █████      █████      █████
    │     █████      █████      █████
 500│     █████      █████      █████      █████
    │     █████      █████      █████      █████
 250│     █████      █████      █████      █████
    │     █████      █████      █████      █████
   0└─────┴─────────┴─────────┴─────────┴─────────
        Donat    Roti      Kue      Brownies
                Coklat    Lapis
```

**Implementation with Recharts**:
```javascript
<BarChart data={chartData} width={600} height={300}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="nama_produk" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Bar dataKey="total_qty" fill="#2563eb" />
</BarChart>
```

---

*Diagram ini dibuat untuk memudahkan visualisasi implementasi Modul 5*  
*Last Updated: 28 Januari 2026*
