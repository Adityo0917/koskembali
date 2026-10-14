import "server-only";

import { FEE_RATE, MIN_FEE, all, get, run, scalar, transaction } from "./db";
import type {
  BookingRow,
  Campus,
  CatalogRow,
  DashboardStat,
  ItemDetail,
  RequestRow,
  SettlementRow,
} from "./types";

export function rupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function maskHp(wa: string): string {
  const digits = wa.replace(/\D/g, "");
  if (digits.length < 6) return wa;
  return `${digits.slice(0, 5)}****${digits.slice(-3)}`;
}

export function getCampus(): Campus[] {
  return all<Campus>("SELECT * FROM campus WHERE aktif = 1 ORDER BY nama");
}

export interface CatalogFilter {
  campusId?: number;
  kategori?: string;
  kondisi?: string;
  minHarga?: number;
  maxHarga?: number;
  q?: string;
  sort?: "termurah" | "termahal" | "terbaru";
}

export function getCatalog(f: CatalogFilter = {}): CatalogRow[] {
  const where: string[] = ["i.status IN ('listed','reserved')"];
  const params: (string | number)[] = [];

  if (f.campusId) {
    where.push("i.campus_id = ?");
    params.push(f.campusId);
  }
  if (f.kategori) {
    where.push("i.kategori = ?");
    params.push(f.kategori);
  }
  if (f.kondisi) {
    where.push("i.kondisi = ?");
    params.push(f.kondisi);
  }
  if (f.minHarga) {
    where.push("i.harga >= ?");
    params.push(f.minHarga);
  }
  if (f.maxHarga) {
    where.push("i.harga <= ?");
    params.push(f.maxHarga);
  }
  if (f.q) {
    where.push("(i.nama LIKE ? OR i.deskripsi LIKE ?)");
    const like = `%${f.q}%`;
    params.push(like, like);
  }

  const order =
    f.sort === "termahal"
      ? "i.harga DESC"
      : f.sort === "terbaru"
        ? "i.created_at DESC"
        : "i.harga ASC";

  return all<CatalogRow>(
    `SELECT i.*, c.nama AS campus_nama, c.kota AS campus_kota,
            (SELECT COUNT(*) FROM item_photo p WHERE p.item_id = i.id) AS jumlah_foto,
            (SELECT p.path FROM item_photo p
              WHERE p.item_id = i.id ORDER BY p.urutan LIMIT 1) AS foto_utama
     FROM item i
     JOIN campus c ON c.id = i.campus_id
     WHERE ${where.join(" AND ")}
     ORDER BY ${order}`,
    ...params,
  );
}

export function getItem(id: number): ItemDetail | null {
  const row = get<ItemDetail>(
    `SELECT i.*, c.nama AS campus_nama, c.kota AS campus_kota,
            s.nama AS seller_nama, pr.kode AS pickup_kode
     FROM item i
     JOIN campus c ON c.id = i.campus_id
     JOIN pickup_request pr ON pr.id = i.pickup_request_id
     JOIN seller s ON s.id = pr.seller_id
     WHERE i.id = ?`,
    id,
  );

  if (!row) return null;

  const foto = all<{ path: string }>(
    "SELECT path FROM item_photo WHERE item_id = ? ORDER BY urutan",
    id,
  ).map((f) => f.path);

  const fee = Math.max(MIN_FEE, Math.round(row.harga * FEE_RATE));

  return {
    ...row,
    foto,
    fee_estimate: fee,
    total_bayar_di_tempat: row.harga - 20000,
  };
}

export function getRequests(status?: string): RequestRow[] {
  const where = status && status !== "all" ? "WHERE pr.status = ?" : "";
  const params = status && status !== "all" ? [status] : [];
  return all<RequestRow>(
    `SELECT pr.*, s.nama AS seller_nama, c.nama AS campus_nama,
            k.nama AS koordinator_nama,
            (SELECT COUNT(*) FROM item i WHERE i.pickup_request_id = pr.id) AS jumlah_item
     FROM pickup_request pr
     JOIN seller s ON s.id = pr.seller_id
     JOIN campus c ON c.id = pr.campus_id
     LEFT JOIN coordinator k ON k.id = pr.koordinator_id
     ${where}
     ORDER BY pr.tgl_jemput ASC, pr.slot ASC`,
    ...params,
  );
}

export function getBookings(): BookingRow[] {
  return all<BookingRow>(
    `SELECT b.*, i.nama AS item_nama, i.harga AS item_harga, i.status AS item_status,
            c.nama AS campus_nama, by.nama AS buyer_nama
     FROM booking b
     JOIN item i ON i.id = b.item_id
     JOIN campus c ON c.id = i.campus_id
     JOIN buyer by ON by.id = b.buyer_id
     ORDER BY b.created_at DESC`,
  );
}

export function getStats(): DashboardStat[] {
  const q = (sql: string) => scalar(sql);

  const pickup = q("SELECT COUNT(*) AS n FROM pickup_request");
  const item = q("SELECT COUNT(*) AS n FROM item");
  const listed = q("SELECT COUNT(*) AS n FROM item WHERE status = 'listed'");
  const sold = q("SELECT COUNT(*) AS n FROM item WHERE status = 'sold'");
  const seller = q("SELECT COUNT(*) AS n FROM seller WHERE status = 'verified'");
  const buyer = q("SELECT COUNT(*) AS n FROM buyer");
  const booking = q("SELECT COUNT(*) AS n FROM booking WHERE status <> 'cancelled'");

  const gmv = q("SELECT COALESCE(SUM(harga), 0) AS n FROM item WHERE status = 'sold'");
  const revenue = Math.round(gmv * FEE_RATE);
  const gp = Math.max(0, (gmv * FEE_RATE - sold * 25000));

  return [
    {
      label: "Item Terjual",
      nilai: String(sold),
      keterangan: `dari ${item} barang terdaftar`,
    },
    {
      label: "GMV",
      nilai: rupiah(gmv),
      keterangan: "nilai barang terjual",
    },
    {
      label: "Revenue",
      nilai: rupiah(revenue),
      keterangan: `fee ${(FEE_RATE * 100).toFixed(0)} persen dari GMV`,
    },
    {
      label: "Laba Kotor",
      nilai: rupiah(gp),
      keterangan: `margin ${gmv > 0 ? ((gp / revenue) * 100).toFixed(1) : "0,0"} persen`,
    },
    {
      label: "Seller Terverifikasi",
      nilai: String(seller),
      keterangan: `${buyer} buyer terdaftar`,
    },
    {
      label: "Booking Aktif",
      nilai: String(booking),
      keterangan: `dari ${pickup} request penjemputan`,
    },
    {
      label: "Barang Tersedia",
      nilai: String(listed),
      keterangan: "siap dibeli di katalog",
    },
  ];
}

export function getSettlements(): SettlementRow[] {
  return all<SettlementRow>(
    `SELECT st.*, pr.kode AS pickup_kode, s.nama AS seller_nama
     FROM settlement st
     JOIN pickup_request pr ON pr.id = st.pickup_request_id
     JOIN seller s ON s.id = pr.seller_id
     ORDER BY st.status = 'paid', st.id DESC`,
  );
}

export function createPickupRequest(input: {
  nama: string;
  whatsapp: string;
  campusId: number;
  fakultas: string;
  cohort: string;
  rekening: string;
  tglJemput: string;
  slot: "pagi" | "siang";
  catatan: string;
  totalEstimasi: number;
}): { kode: string } {
  return transaction((): { kode: string } => {
    // Seller dicocokkan lewat WhatsApp: submit ulang oleh orang yang sama harus
    // memperbarui seller yang ada, bukan menambah duplikat. Selain mencegah
    // seller yatim, ini juga membuat KPI repeat seller rate terukur.
    const existing = get<{ id: number }>(
      `SELECT id FROM seller WHERE whatsapp = ? ORDER BY id LIMIT 1`,
      input.whatsapp,
    );

    let sellerId: number;
    if (existing) {
      sellerId = existing.id;
      run(
        `UPDATE seller
        SET nama = ?, campus_id = ?, fakultas = ?, cohort = ?, rekening = ?, status = 'verified'
        WHERE id = ?`,
        input.nama,
        input.campusId,
        input.fakultas,
        input.cohort,
        input.rekening,
        sellerId,
      );
    } else {
      const seller = run(
        `INSERT INTO seller (nama, whatsapp, campus_id, fakultas, cohort, rekening, status)
       VALUES (?, ?, ?, ?, ?, ?, 'verified')`,
        input.nama,
        input.whatsapp,
        input.campusId,
        input.fakultas,
        input.cohort,
        input.rekening,
      );
      sellerId = Number(seller.lastInsertRowid);
    }
    // MAX(substr) + 1, bukan COUNT(*)+1: COUNT tidak pernah turun saat request
    // dibatalkan/dihapus sehingga bisa menghasilkan kode yang sudah dipakai.
    const maxSeq = Number(
      scalar(
        `SELECT COALESCE(MAX(CAST(substr(kode, 9) AS INTEGER)), 0) AS n
       FROM pickup_request WHERE kode LIKE 'PR-2026-%'`,
      ),
    );
    const kode = `PR-2026-${String(maxSeq + 1).padStart(4, "0")}`;

    run(
      `INSERT INTO pickup_request
         (kode, seller_id, campus_id, tgl_jemput, slot, catatan, total_estimasi, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      kode,
      sellerId,
      input.campusId,
      input.tglJemput,
      input.slot,
      input.catatan || null,
      input.totalEstimasi,
    );

    return { kode };
  });
}

export function createBooking(input: {
  itemId: number;
  buyerNama: string;
  buyerWa: string;
  buyerCampus?: number;
  tglPickup: string;
  slot: "pagi" | "siang";
  catatan: string;
}): { kode: string; totalDiTempat: number } | { error: string } {
  const item = getItem(input.itemId);
  if (!item) return { error: "Barang tidak ditemukan" };
  if (item.status !== "listed")
    return { error: "Barang sudah tidak tersedia" };

  let result!: { kode: string; totalDiTempat: number };
  const campusId = input.buyerCampus ?? item.campus_id;
  if (!get<Campus>("SELECT id FROM campus WHERE id = ? AND aktif = 1", campusId)) {
    return { error: "Kampus tidak ditemukan atau tidak aktif" };
  }

  try {
    transaction(() => {
      const nowStatus = get<{ status: string }>(
        "SELECT status FROM item WHERE id = ?",
        input.itemId,
      );
      if (nowStatus?.status !== "listed") {
        throw new Error("Barang sudah tidak tersedia");
      }

      const buyer = run(
        "INSERT INTO buyer (nama, whatsapp, campus_id) VALUES (?, ?, ?)",
        input.buyerNama,
        input.buyerWa,
        campusId,
      );
      const buyerId = Number(buyer.lastInsertRowid);

      const seq = scalar("SELECT COUNT(*) AS n FROM booking") + 1;
      const kode = `BK-2026-${String(seq).padStart(4, "0")}`;

      run(
        `INSERT INTO booking (kode, item_id, buyer_id, tgl_pickup, slot, dp_amount, dp_status, status, catatan)
         VALUES (?, ?, ?, ?, ?, 20000, 'paid', 'confirmed', ?)`,
        kode,
        input.itemId,
        buyerId,
        input.tglPickup,
        input.slot,
        input.catatan || null,
      );

      run("UPDATE item SET status = 'reserved' WHERE id = ?", input.itemId);

      result = { kode, totalDiTempat: item.total_bayar_di_tempat };
    });
  } catch (error) {
    return { error: (error as Error).message };
  }

  return result;
}