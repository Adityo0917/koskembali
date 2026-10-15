# KosKembali

Mockup aplikasi untuk model bisnis **Managed Consignment + Logistics**: mahasiswa
menitipkan barang kos yang tidak terpakai, tim KosKembali menjemput, memfoto, menentukan
harga, lalu menjualnya. Penjual dibayar setelah barang terjual.

Proyek ini adalah bagian dari tugas kelompok KosKembali. Dokumen bisnis pendamping
(Post Mortem, Studi Kelayakan Bisnis, Project Plan, PRD, dan Laporan Desain UI/UX)
berada di luar repo ini.

## Teknologi

| Lapisan | Teknologi |
|---------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Bahasa | TypeScript |
| UI | React 19 + Tailwind CSS 4 |
| Validasi | zod |
| Akun pengguna | Netlify Identity (email/password dan Google OAuth) |
| Basis data | SQLite3 lewat `node:sqlite` bawaan Node.js |

Tidak ada ORM atau library ikon. Layanan akun menggunakan Netlify Identity. Seluruh ikon
memakai SVG inline. Database katalog dibuat dan diisi data contoh secara otomatis saat aplikasi
pertama kali dijalankan.

## Menjalankan Secara Lokal

### Prasyarat

- **Node.js 23.4 atau lebih baru** — proyek memakai modul `node:sqlite` bawaan Node.js.
  Modul ini tersedia sejak Node 22.5, tetapi baru bisa dipakai tanpa flag
  `--experimental-sqlite` mulai Node 23.4. Proyek ini diuji pada Node 24.
- npm

### Langkah

```bash
# 1. Pasang dependensi
npm install

# 2. Siapkan variabel lingkungan
cp .env.example .env.local        # Windows: copy .env.example .env.local
```

Buka `.env.local` dan isi kunci dashboard koordinator. Pilih string acak apa pun;
minimal 8 karakter.

```
KOSKEMBALI_COORDINATOR_KEY=kunci-acak-pilihan-anda
```

```bash
# 3. Jalankan
npm run dev
```

Buka <http://localhost:3000>.

Pada eksekusi pertama, aplikasi otomatis membuat folder `data/`, membuat seluruh tabel,
dan mengisi 6 kampus, 14 barang, 28 foto, 8 penjual, 5 booking, dan 3 settlement sebagai
data contoh. Tidak perlu migrasi atau seeding manual.

### Perintah Lain

```bash
npm run build      # build produksi
npm run start      # jalankan hasil build
npm run lint       # ESLint
npm run typecheck  # pemeriksaan tipe TypeScript
```

## Halaman

| Rute | Isi |
|------|-----|
| `/` | Landing page: penjelasan alur dan formulir pickup |
| `/katalog` | Daftar barang dengan filter kampus dan kategori |
| `/katalog/[id]` | Detail barang, galeri foto, dan tombol booking |
| `/daftar` | Formulir pengajuan penjemputan barang |
| `/daftar/status` | Pelacakan status request berdasarkan kode pickup |
| `/booking/[kode]` | Detail booking |
| `/pembayaran` | Simulasi pembayaran DP dengan pilihan QRIS, virtual account, dan dompet digital |
| `/login` | Login Google/email, pendaftaran, pemulihan password, dan menu akun |
| `/koordinator` | Dashboard internal (perlu login) |

### Akun Pengguna

Menu **Masuk** tersedia pada navigasi desktop dan seluler. Pengguna dapat mendaftar
dengan email dan password, mengonfirmasi email, masuk, memulihkan password, dan
keluar melalui Netlify Identity. Sesi akun mengikuti perubahan login/logout,
termasuk pada tab browser lain. Login pengguna tidak memberikan akses ke dashboard
koordinator; autentikasi koordinator tetap terpisah.

Untuk menjalankan layanan akun secara lokal, gunakan `netlify dev --port 8889`.
Untuk login Google, aktifkan provider Google pada pengaturan Identity di Netlify
dan lengkapi konfigurasi OAuth di Google Cloud serta callback URL yang ditampilkan
Netlify. Simpan kredensial OAuth hanya pada pengaturan layanan, bukan dalam kode
atau browser. Tombol Google memeriksa ketersediaan provider dan menampilkan
penjelasan jika konfigurasi belum aktif. Pendaftaran email memerlukan konfirmasi
email kecuali pengelola mengaktifkan konfirmasi otomatis.

### Simulasi Pembayaran

Halaman `/pembayaran` menyediakan tiga metode demo: QRIS, virtual account, dan
dompet digital. Pengguna memilih metode, memeriksa ringkasan DP Rp20.000,
menyetujui bahwa transaksi hanya simulasi, lalu melihat hasil demo. Halaman detail
booking menyediakan tautan ke demo dengan kode booking sebagai referensi.

Simulasi tidak membuat transaksi, nomor rekening, kode QR untuk pembayaran, atau
riwayat pembayaran; tidak menagih uang dan tidak mengubah status booking. Hasil
hanya berlaku selama halaman terbuka dan direset setelah dimuat ulang. Kode
booking pada demo hanya referensi dan tidak memverifikasi kepemilikan atau
keberadaan booking. Tidak ada pengumpulan data kartu, PIN, atau OTP.

## API

| Endpoint | Metode | Isi |
|----------|--------|-----|
| `/api/pickup` | POST | Membuat request penjemputan baru |
| `/api/booking` | POST | Membuat booking barang |
| `/api/koordinator/login` | POST | Login koordinator, sekaligus logout jika body `{"key":""}` |

### Autentikasi Koordinator

Dashboard `/koordinator` dilindungi kunci yang disimpan di `KOSKEMBALI_COORDINATOR_KEY`.
Kunci diverifikasi di server, lalu sesi disimpan pada cookie `kk_koordinator` bertanda
`httpOnly`. Kunci tidak pernah dikirim ke sisi klien.

## Struktur Basis Data

Sembilan tabel: `campus`, `coordinator`, `seller`, `pickup_request`, `item`,
`item_photo`, `buyer`, `booking`, `settlement`.

Aturan integritas yang ditegakkan di tingkat skema dan kode:

- `PRAGMA foreign_keys = ON` aktif di setiap koneksi.
- Satu barang hanya boleh punya satu booking aktif pada satu waktu.
- Barang berstatus `reserved` atau `sold` selalu punya booking terkait.
- Barang `sold` selalu punya booking berstatus `completed`.
- Setiap pembeli terhubung ke kampus yang sah.
- Pembuatan request pickup berjalan dalam satu transaksi, dan nomor urut
  `PR-YYYY-XXXX` dihitung dengan `MAX(CAST(substr(kode, 9) AS INTEGER)) + 1` sehingga
  tetap aman ketika beberapa request dibuat bersamaan.

## Skrip Audit

Skrip berikut dipakai untuk memverifikasi mutu aplikasi dan memerlukan `npm install`
terlebih dahulu.

| Skrip | Fungsi |
|-------|--------|
| `npm run db:check` | Memeriksa integritas SQLite: pelanggaran foreign key, booking ganda per barang, dan status yang tidak konsisten |
| `npm run qa:text` | Memindai berkas sumber dari karakter CJK atau aksen asing yang tidak disengaja |
| `npm run qa:layout` | Membuka aplikasi pada beberapa ukuran viewport dan memeriksa overflow horizontal, galat konsol, tinggi target sentuh, dan kelengkapan label |
| `npm run qa:contrast` | Menghitung rasio kontras WCAG 2.1 AA setiap pasangan warna teks dan latar yang benar-benar dirender di peramban |
| `npm run qa:shots` | Mengambil screenshot seluruh halaman di tiga breakpoint dan menyimpan hasil auditnya |

`db:check` dan `qa:text` tidak memerlukan aplikasi berjalan. `qa:layout`, `qa:contrast`,
dan `qa:shots` memakai Puppeteer, sehingga memerlukan Google Chrome yang terpasang dan
aplikasi yang sudah berjalan di `http://localhost:3111`. Jalankan di terminal terpisah:

```bash
KOSKEMBALI_COORDINATOR_KEY=kunci-anda npx next start -p 3111
```

## Design Token dan Aksesibilitas

Warna utama oranye `#f98806` dan hijau `#20c55d` hanya mencapai sekitar 2,3:1 di atas
latar putih, sehingga tidak lolos WCAG AA untuk teks berukuran kecil. Karena itu
`globals.css` mendefinisikan dua kelompok token yang terpisah:

- Warna **solid** (`success-solid`, `accent-solid`) untuk latar bidang yang memuat teks
  putih.
- Warna **teks** (`success-text`, `warning-text`, `error-text`, `accent-text`) berupa
  varian gelap untuk teks kecil di atas latar terang.

Hasil audit terakhir: 107 kombinasi warna teks/latar diukur, seluruhnya lolos ambang
WCAG 2.1 AA, dengan rasio terendah 4,87:1.

## Batasan penting nian ni asli yang Belum Diselesaikan 

1. **Pembayaran masih simulasi.** Halaman pembayaran telah menyediakan alur demo
   dengan penandaan eksplisit bahwa uang tidak ditagih. Status DP booking lama
   masih di-hardcode sebagai `paid` dan diberi label data simulasi. Belum ada
   integrasi Midtrans, Xendit, atau penyedia lain.
2. **RBAC belum ada.** Autentikasi baru memisahkan akses koordinator dari pengunjung
   umum. Akun pengguna telah menggunakan Netlify Identity, tetapi belum ada
   pembagian hak akses atau riwayat booking berdasarkan akun.
3. **SQLite belum tervalidasi untuk hosting serverless.** SQLite berjalan baik di
   komputer lokal, tetapi tidak bisa ditulis pada filesystem read-only seperti Vercel.
   Untuk produksi perlu berpindah ke Turso/libSQL, PostgreSQL, atau basis data terkelola
   lain.
4. **Foto barang adalah placeholder.** Seluruh aset di `public/barang/` adalah SVG yang
   dibuat khusus untuk mockup, bukan foto barang asli.
5. **Uji screen reader dan navigasi keyboard belum dilakukan.** Audit aksesibilitas yang
   sudah berjalan baru mencakup kontras warna, tinggi target sentuh, label formulir,
   hierarki heading, dan teks alternatif gambar.
