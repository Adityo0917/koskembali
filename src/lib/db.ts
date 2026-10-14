import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

/**
 * Lapisan data KosKembali.
 *
 * Menggunakan node:sqlite (bawaan Node 22+) sehingga tidak ada native
 * compilation dan tidak ada kredensial di environment client.
 *
 * Isolasi per-lingkungan memakai DATABASE_PATH supaya file uji tidak
 * menimpa database pengembangan.
 */

const DATA_DIR = process.env.DATABASE_PATH
  ? path.dirname(process.env.DATABASE_PATH)
  : path.join(process.cwd(), "data");

const DB_FILE =
  process.env.DATABASE_PATH ?? path.join(DATA_DIR, "koskembali.sqlite");

let instance: DatabaseSync | null = null;

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS campus (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  kode      TEXT NOT NULL UNIQUE,
  nama      TEXT NOT NULL,
  kota      TEXT NOT NULL,
  alamat    TEXT NOT NULL,
  aktif     INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS coordinator (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  nama      TEXT NOT NULL,
  whatsapp  TEXT NOT NULL,
  campus_id INTEGER NOT NULL REFERENCES campus(id),
  aktif     INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS seller (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  nama      TEXT NOT NULL,
  whatsapp  TEXT NOT NULL,
  campus_id INTEGER NOT NULL REFERENCES campus(id),
  fakultas  TEXT NOT NULL,
  cohort    TEXT,
  rekening   TEXT,
  status    TEXT NOT NULL DEFAULT 'draft'
            CHECK (status IN ('draft','verified','rejected')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pickup_request (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  kode         TEXT NOT NULL UNIQUE,
  seller_id    INTEGER NOT NULL REFERENCES seller(id),
  campus_id    INTEGER NOT NULL REFERENCES campus(id),
  tgl_jemput   TEXT NOT NULL,
  slot         TEXT NOT NULL CHECK (slot IN ('pagi','siang')),
  catatan      TEXT,
  total_estimasi INTEGER NOT NULL DEFAULT 1,
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','scheduled','picked_up','completed','cancelled')),
  koordinator_id INTEGER REFERENCES coordinator(id),
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS item (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  pickup_request_id INTEGER NOT NULL REFERENCES pickup_request(id),
  nama              TEXT NOT NULL,
  kategori          TEXT NOT NULL
                    CHECK (kategori IN ('perabot','elektronik','dapur','kamar','belajar','rumah_tangga','lainnya')),
  kondisi           TEXT NOT NULL
                    CHECK (kondisi IN ('baru','seperti_baru','baik','layak')),
  deskripsi         TEXT,
  harga             INTEGER NOT NULL CHECK (harga > 0),
  harga_baru        INTEGER,
  campus_id         INTEGER NOT NULL REFERENCES campus(id),
  status            TEXT NOT NULL DEFAULT 'listed'
                    CHECK (status IN ('listed','reserved','sold','withdrawn')),
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS item_photo (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL REFERENCES item(id) ON DELETE CASCADE,
  path    TEXT NOT NULL,
  urutan  INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS buyer (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  nama      TEXT NOT NULL,
  whatsapp  TEXT NOT NULL,
  campus_id INTEGER NOT NULL REFERENCES campus(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS booking (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  kode       TEXT NOT NULL UNIQUE,
  item_id    INTEGER NOT NULL REFERENCES item(id),
  buyer_id   INTEGER NOT NULL REFERENCES buyer(id),
  tgl_pickup TEXT NOT NULL,
  slot       TEXT NOT NULL CHECK (slot IN ('pagi','siang')),
  dp_amount  INTEGER NOT NULL DEFAULT 20000,
  dp_status  TEXT NOT NULL DEFAULT 'unpaid'
             CHECK (dp_status IN ('unpaid','paid','refunded')),
  status     TEXT NOT NULL DEFAULT 'pending'
             CHECK (status IN ('pending','confirmed','completed','cancelled','no_show')),
  catatan    TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settlement (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  pickup_request_id INTEGER NOT NULL REFERENCES pickup_request(id),
  gross_amount      INTEGER NOT NULL DEFAULT 0,
  fee_amount        INTEGER NOT NULL DEFAULT 0,
  net_payout        INTEGER NOT NULL DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','paid','cancelled')),
  paid_at           TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_item_status    ON item(status);
CREATE INDEX IF NOT EXISTS idx_item_kategori  ON item(kategori);
CREATE INDEX IF NOT EXISTS idx_item_campus    ON item(campus_id);
CREATE INDEX IF NOT EXISTS idx_pr_status      ON pickup_request(status);
CREATE INDEX IF NOT EXISTS idx_booking_item   ON booking(item_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_booking_item_aktif
  ON booking(item_id) WHERE status <> 'cancelled';
`;

function seed(db: DatabaseSync): void {
  const count = db
    .prepare("SELECT COUNT(*) AS n FROM campus")
    .get() as { n: number };
  if (count.n > 0) return;

  db.exec("BEGIN");
  try {
    const insCampus = db.prepare(
      "INSERT INTO campus (kode, nama, kota, alamat) VALUES (?, ?, ?, ?)",
    );
    const campuses = [
      ["UI", "Universitas Indonesia", "Depok", "Jl. Margonda Raya, Depok"],
      ["ITB", "Institut Teknologi Bandung", "Bandung", "Jl. Ganesha, Bandung"],
      ["UGM", "Universitas Gadjah Mada", "Yogyakarta", "Jl. Kaliurang, Sleman, Yogyakarta"],
      ["ITS", "Institut Teknologi Sepuluh Nopember", "Surabaya", "Jl. ITS, Surabaya"],
      ["UNTAR", "Universitas Tarumanagara", "Jakarta", "Jl. S. Parman, Jakarta"],
      ["UNPAD", "Universitas Padjadjaran", "Bandung", "Jl. Ir. Djuanda, Sumedang, Bandung"],
    ];
    for (const c of campuses) insCampus.run(...(c as string[]));

    const insCoord = db.prepare(
      "INSERT INTO coordinator (nama, whatsapp, campus_id) VALUES (?, ?, ?)",
    );
    insCoord.run("Dimas Prasetyo", "081234560001", 1);
    insCoord.run("Rina Wulandari", "081234560002", 2);
    insCoord.run("Bagas Nugroho", "081234560003", 3);

    const insSeller = db.prepare(
      `INSERT INTO seller (nama, whatsapp, campus_id, fakultas, cohort, rekening, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );
    const sellers = [
      ["Andi Saputra", "081111110001", 1, "Teknik", "S1 2022/2026", "1234567890", "verified"],
      ["Siti Nurhaliza", "081111110002", 1, "Ilmu Hukum", "S1 2022/2026", "1234567891", "verified"],
      ["Budi Santoso", "081111110003", 2, "Informatika", "S1 2023/2027", "1234567892", "verified"],
      ["Dewi Lestari", "081111110004", 3, "Ekonomi", "S1 2022/2026", "1234567893", "verified"],
      ["Eko Purnomo", "081111110005", 4, "Teknik", "S1 2021/2025", "1234567894", "verified"],
      ["Fitri Handayani", "081111110006", 5, "Psikologi", "S1 2023/2027", "1234567895", "draft"],
      ["Gilang Ramadhan", "081111110007", 6, "Sastra", "S1 2022/2026", "1234567896", "verified"],
      ["Hana Kusuma", "081111110008", 1, "Farmasi", "S1 2023/2027", "1234567897", "verified"],
    ];
    for (const s of sellers) insSeller.run(...(s as string[]));

    const insReq = db.prepare(
      `INSERT INTO pickup_request
         (kode, seller_id, campus_id, tgl_jemput, slot, catatan, total_estimasi, status, koordinator_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    const requests = [
      ["PR-2026-0001", 1, 1, "2026-11-04", "pagi", "Kasur dan lemari kecil", 3, "completed", 1, "2026-10-28 08:00:00"],
      ["PR-2026-0002", 2, 1, "2026-11-05", "siang", "Meja belajar dan kursi", 2, "completed", 1, "2026-10-28 09:30:00"],
      ["PR-2026-0003", 4, 3, "2026-11-05", "pagi", "Kulkas mini", 1, "completed", 3, "2026-10-29 10:00:00"],
      ["PR-2026-0004", 5, 4, "2026-11-06", "siang", "Panci, wajan, kompor gas", 5, "scheduled", 3, "2026-10-30 11:00:00"],
      ["PR-2026-0005", 7, 6, "2026-11-06", "pagi", "Rak buku dan lampu meja", 4, "scheduled", 3, "2026-10-30 14:00:00"],
      ["PR-2026-0006", 8, 1, "2026-11-07", "siang", "Kipas angin dan lemari", 2, "pending", 1, "2026-11-01 09:00:00"],
      ["PR-2026-0007", 3, 2, "2026-11-07", "pagi", "Laptop dan mouse", 2, "pending", 2, "2026-11-01 10:00:00"],
    ];
    for (const r of requests) insReq.run(...(r as (string | number)[]));

    const insItem = db.prepare(
      `INSERT INTO item
         (pickup_request_id, nama, kategori, kondisi, deskripsi, harga, harga_baru, campus_id, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    const insPhoto = db.prepare(
      "INSERT INTO item_photo (item_id, path, urutan) VALUES (?, ?, ?)",
    );
    const items = [
      [1, "Kasur Single Spring", "kamar", "seperti_baru", "Kasur single size 90x200 cm, kondisi sangat baik, tidak ada noda. Spring normal dan tidak berbunyi.", 450000, 900000, 1, "sold", "2026-10-29 10:00:00"],
      [1, "Lemari Pakaian 2 Pintu", "perabot", "baik", "Lemari kayu 2 pintu, tinggi 180 cm, ada goresan kecil di pintu bawah.", 550000, 1100000, 1, "sold", "2026-10-29 10:05:00"],
      [1, "Meja Belajar Kayu", "belajar", "baik", "Meja belajar ukuran 120x60 cm, kuat, laci atas masih berfungsi.", 350000, 700000, 1, "sold", "2026-10-29 10:10:00"],
      [2, "Kursi Belajar Kain", "kamar", "layak", "Kursi belajar dengan dudukan kain, kaki kayu masih kokoh, cocok untuk meja belajar", 120000, 250000, 1, "reserved", "2026-10-29 11:00:00"],
      [2, "Rak Buku Susun", "perabot", "seperti_baru", "Rak buku susun 5 tingkat, kondisi baru, belum pernah dipakai dan tidak ada goresan.", 250000, 500000, 1, "listed", "2026-10-29 11:05:00"],
      [3, "Kulkas Mini 60L", "dapur", "seperti_baru", "Kulkas mini kapasitas 60 liter, kondisi sangat baik, konsumsi listrik rendah. Freezer atasnya berukuran kecil.", 850000, 1700000, 3, "sold", "2026-10-29 14:00:00"],
      [3, "Panci Stainless 12 inci", "dapur", "baik", "Set panci 3 ukuran, stainless steel, tidak penyok.", 180000, 380000, 3, "listed", "2026-10-29 14:05:00"],
      [3, "Kompor Gas Tunggal", "dapur", "layak", "Kompor gas 1 tungku, masih berfungsi normal, ada regulator.", 200000, 420000, 3, "listed", "2026-10-29 14:10:00"],
      [4, "Wajan Goreng 26 inci", "dapur", "baik", "Wajan goreng stainless ukuran 26 inci, sisi luar ada noda hitam ringan yang mudah dibersihkan.", 90000, 200000, 4, "listed", "2026-10-30 09:00:00"],
      [4, "Panci Teplok 8 inci", "dapur", "baik", "Panci teplok 2 ukuran, masih rapat dan tidak bocor.", 75000, 160000, 4, "listed", "2026-10-30 09:05:00"],
      [4, "Set Sutil 14 Pcs", "dapur", "seperti_baru", "Set sutil 14 pcs, kondisi baru, lengkap dengan tutup dan kotak penyimpanan.", 220000, 450000, 4, "listed", "2026-10-30 09:10:00"],
      [5, "Rak Buku Minimalis", "perabot", "seperti_baru", "Rak buku dinding, kayu solid, kondisi baru.", 300000, 620000, 6, "listed", "2026-10-30 11:00:00"],
      [5, "Lampu Meja USB", "perabot", "baru", "Lampu meja dengan port USB, kondisi baru, segel masih ada.", 85000, 175000, 6, "listed", "2026-10-30 11:05:00"],
      [5, "Kursi Belajar Tanpa Roda", "belajar", "baik", "Kursi belajar ergonomis, sandaran lumbar, kondisi baik.", 275000, 560000, 6, "listed", "2026-10-30 11:10:00"],
    ] as const;
    for (const it of items) {
      insItem.run(...(it as unknown as (string | number)[]));
      const itemId = Number(
        (db.prepare("SELECT last_insert_rowid() AS id").get() as { id: number }).id,
      );
      insPhoto.run(itemId, `/barang/${itemId}-1.svg`, 1);
      insPhoto.run(itemId, `/barang/${itemId}-2.svg`, 2);
    }

    const insBuyer = db.prepare(
      "INSERT INTO buyer (nama, whatsapp, campus_id) VALUES (?, ?, ?)",
    );
    const buyers = [
      ["Rina Amelia", "082222220001", 1],
      ["Yoga Pratama", "082222220002", 2],
      ["Intan Permata", "082222220003", 1],
      ["Bayu Setiawan", "082222220004", 3],
      ["Nadia Farhani", "082222220005", 4],
      ["Fajar Maulana", "082222220006", 6],
    ];
    for (const b of buyers) insBuyer.run(...(b as string[]));

    const insBooking = db.prepare(
      `INSERT INTO booking (kode, item_id, buyer_id, tgl_pickup, slot, dp_amount, dp_status, status, created_at)
       VALUES (?, ?, ?, ?, ?, 20000, ?, ?, ?)`,
    );
    const bookings = [
      ["BK-2026-0001", 1, 1, "2026-11-04", "pagi", "paid", "completed", "2026-11-01 10:00:00"],
      ["BK-2026-0002", 2, 1, "2026-11-04", "pagi", "paid", "completed", "2026-11-01 10:05:00"],
      ["BK-2026-0003", 3, 3, "2026-11-05", "siang", "paid", "completed", "2026-11-01 10:10:00"],
      ["BK-2026-0004", 4, 1, "2026-11-05", "siang", "paid", "confirmed", "2026-11-02 09:00:00"],
      ["BK-2026-0005", 6, 4, "2026-11-05", "pagi", "paid", "completed", "2026-11-02 09:30:00"],
    ];
    for (const bk of bookings) insBooking.run(...(bk as string[]));

    const insSettlement = db.prepare(
      `INSERT INTO settlement (pickup_request_id, gross_amount, fee_amount, net_payout, status, paid_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    );
    const settlements = [
      [1, 1350000, 108000, 1242000, "paid", "2026-11-06 10:00:00"],
      [2, 370000, 29600, 340400, "pending", null],
      [3, 850000, 68000, 782000, "paid", "2026-11-07 15:00:00"],
    ];
    for (const st of settlements) insSettlement.run(...(st as (string | number | null)[]));

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

/**
 * node:sqlite mengembalikan baris dengan prototype null.
 * Objek tersebut gagal diserialisasi React Server Component saat dikirim
 * ke Client Component, jadi setiap hasil query dinormalisasi ke objek biasa.
 */
function plain<T>(rows: unknown[]): T[] {
  return rows.map((r) => ({ ...(r as object) })) as T[];
}

type Param = string | number | null | bigint | Uint8Array;

export function all<T>(sql: string, ...params: Param[]): T[] {
  return plain<T>(getDb().prepare(sql).all(...params));
}

export function get<T>(sql: string, ...params: Param[]): T | undefined {
  const row = getDb().prepare(sql).get(...params) as object | undefined;
  return row ? ({ ...row } as T) : undefined;
}

export function run(sql: string, ...params: Param[]) {
  return getDb().prepare(sql).run(...params);
}

export function scalar(sql: string, ...params: (string | number)[]): number {
  const row = getDb().prepare(sql).get(...params) as
    | { n: number }
    | undefined;
  return row?.n ?? 0;
}

export function transaction<T>(fn: () => T): T {
  const db = getDb();
  db.exec("BEGIN");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function getDb(): DatabaseSync {
  if (instance) return instance;

  const dir = path.dirname(DB_FILE);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const db = new DatabaseSync(DB_FILE);
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(SCHEMA);
  seed(db);
  instance = db;
  return db;
}

export function closeDb(): void {
  if (instance) {
    instance.close();
    instance = null;
  }
}

export const FEE_RATE = 0.08;
export const MIN_FEE = 25000;
export const OPS_PER_PICKUP = 25000;
export const DP_AMOUNT = 20000;