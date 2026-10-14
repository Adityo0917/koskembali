export type ItemStatus = "listed" | "reserved" | "sold" | "withdrawn";
export type Kondisi = "baru" | "seperti_baru" | "baik" | "layak";
export type Kategori =
  | "perabot"
  | "elektronik"
  | "dapur"
  | "kamar"
  | "belajar"
  | "rumah_tangga"
  | "lainnya";
export type RequestStatus =
  | "pending"
  | "scheduled"
  | "picked_up"
  | "completed"
  | "cancelled";
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";
export type DpStatus = "unpaid" | "paid" | "refunded";

export interface Campus {
  id: number;
  kode: string;
  nama: string;
  kota: string;
  alamat: string;
  aktif: number;
}

export interface Seller {
  id: number;
  nama: string;
  whatsapp: string;
  campus_id: number;
  fakultas: string;
  cohort: string | null;
  rekening: string | null;
  status: "draft" | "verified" | "rejected";
  created_at: string;
}

export interface PickupRequest {
  id: number;
  kode: string;
  seller_id: number;
  campus_id: number;
  tgl_jemput: string;
  slot: "pagi" | "siang";
  catatan: string | null;
  total_estimasi: number;
  status: RequestStatus;
  koordinator_id: number | null;
  created_at: string;
}

export interface Item {
  id: number;
  pickup_request_id: number;
  nama: string;
  kategori: Kategori;
  kondisi: Kondisi;
  deskripsi: string | null;
  harga: number;
  harga_baru: number | null;
  campus_id: number;
  status: ItemStatus;
  created_at: string;
}

export interface ItemFoto {
  id: number;
  item_id: number;
  path: string;
  urutan: number;
}

export interface Buyer {
  id: number;
  nama: string;
  whatsapp: string;
  campus_id: number;
  created_at: string;
}

export interface Booking {
  id: number;
  kode: string;
  item_id: number;
  buyer_id: number;
  tgl_pickup: string;
  slot: "pagi" | "siang";
  dp_amount: number;
  dp_status: DpStatus;
  status: BookingStatus;
  catatan: string | null;
  created_at: string;
}

export interface Coordinator {
  id: number;
  nama: string;
  whatsapp: string;
  campus_id: number;
  aktif: number;
}

export interface Settlement {
  id: number;
  pickup_request_id: number;
  gross_amount: number;
  fee_amount: number;
  net_payout: number;
  status: "pending" | "paid" | "cancelled";
  paid_at: string | null;
  created_at: string;
}

export interface SettlementRow extends Settlement {
  pickup_kode: string;
  seller_nama: string;
}

export interface ItemDetail extends Item {
  campus_nama: string;
  campus_kota: string;
  seller_nama: string;
  pickup_kode: string;
  foto: string[];
  fee_estimate: number;
  total_bayar_di_tempat: number;
}

export interface CatalogRow extends Item {
  campus_nama: string;
  campus_kota: string;
  jumlah_foto: number;
  foto_utama: string | null;
}

export interface DashboardStat {
  label: string;
  nilai: string;
  keterangan: string;
}

export interface RequestRow extends PickupRequest {
  seller_nama: string;
  campus_nama: string;
  koordinator_nama: string | null;
  jumlah_item: number;
}

export interface BookingRow extends Booking {
  item_nama: string;
  item_harga: number;
  campus_nama: string;
  buyer_nama: string;
  item_status: ItemStatus;
}

export const LABEL_KONDISI: Record<Kondisi, string> = {
  baru: "Baru",
  seperti_baru: "Seperti Baru",
  baik: "Baik",
  layak: "Layak Pakai",
};

export const WARNA_KONDISI: Record<Kondisi, string> = {
  baru: "bg-success/10 text-success-text border-success/30",
  seperti_baru: "bg-success/10 text-success-text border-success/30",
  baik: "bg-warning/10 text-warning-text border-warning/30",
  layak: "bg-error/10 text-error-text border-error/30",
};

export const LABEL_KATEGORI: Record<Kategori, string> = {
  perabot: "Perabot",
  elektronik: "Elektronik",
  dapur: "Dapur",
  kamar: "Kamar",
  belajar: "Belajar",
  rumah_tangga: "Rumah Tangga",
  lainnya: "Lainnya",
};

export const LABEL_STATUS_ITEM: Record<ItemStatus, string> = {
  listed: "Tersedia",
  reserved: "Dipesan",
  sold: "Terjual",
  withdrawn: "Ditarik",
};

export const WARNA_STATUS_ITEM: Record<ItemStatus, string> = {
  listed: "bg-success/10 text-success-text border-success/30",
  reserved: "bg-warning/10 text-warning-text border-warning/30",
  sold: "bg-secondary/10 text-text-secondary border-secondary/20",
  withdrawn: "bg-error/10 text-error-text border-error/30",
};

export const LABEL_STATUS_REQUEST: Record<RequestStatus, string> = {
  pending: "Menunggu",
  scheduled: "Terjadwal",
  picked_up: "Sudah Dijemput",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export const LABEL_STATUS_BOOKING: Record<BookingStatus, string> = {
  pending: "Menunggu",
  confirmed: "Dikonfirmasi",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  no_show: "Tidak Hadir",
};