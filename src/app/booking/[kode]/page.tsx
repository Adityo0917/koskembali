import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { get } from "@/lib/db";
import { rupiah } from "@/lib/queries";
import {
  LABEL_STATUS_BOOKING,
  LABEL_STATUS_ITEM,
  type BookingStatus,
  type ItemStatus,
} from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ kode: string }>;
}

interface Row {
  kode: string;
  item_nama: string;
  item_harga: number;
  item_status: string;
  campus_nama: string;
  nama: string;
  whatsapp: string;
  tgl_pickup: string;
  slot: string;
  dp_amount: number;
  dp_status: string;
  status: string;
  catatan: string | null;
}

export default async function BookingDetailPage({ params }: PageProps) {
  const { kode } = await params;

  const row = get<Row>(
    `SELECT b.kode, i.nama AS item_nama, i.harga AS item_harga,
            i.status AS item_status, c.nama AS campus_nama,
            by.nama, by.whatsapp, b.tgl_pickup, b.slot,
            b.dp_amount, b.dp_status, b.status, b.catatan
     FROM booking b
     JOIN item i ON i.id = b.item_id
     JOIN campus c ON c.id = i.campus_id
     JOIN buyer by ON by.id = b.buyer_id
     WHERE b.kode = ?`,
    kode,
  );

  if (!row) notFound();

  const sisa = row.item_harga - row.dp_amount;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <div className="rounded-2xl border border-success/30 bg-success/5 p-6 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-solid text-white">
          <svg
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </span>
        <h1 className="mt-4 text-2xl font-bold text-text-primary">
          Barang berhasil dipesan
        </h1>
        <p className="mt-1 text-text-secondary">
          Simpan nomor booking Anda untuk keperluantook .
        </p>
        <p className="mt-4 inline-block rounded-lg bg-card px-5 py-2 text-lg font-bold tracking-wide text-primary">
          {row.kode}
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-text-primary">
              {row.item_nama}
            </h2>
            <p className="text-sm text-text-secondary">
              {row.campus_nama}
            </p>
          </div>
          <Badge
            tone={
              row.status === "completed"
                ? "success"
                : row.status === "cancelled"
                  ? "error"
                  : "accent"
            }
          >
            {LABEL_STATUS_BOOKING[row.status as BookingStatus]}
          </Badge>
        </div>

        <dl className="mt-5 space-y-2.5 border-t border-border pt-5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-text-secondary">Nama pemesan</dt>
            <dd className="font-medium text-text-primary">{row.nama}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-text-secondary">Jadwal pengambilan</dt>
            <dd className="font-medium text-text-primary">
              {row.tgl_pickup} ({row.slot})
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-text-secondary">Harga barang</dt>
            <dd className="font-medium text-text-primary">
              {rupiah(row.item_harga)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-text-secondary">DP sudah dibayar</dt>
            <dd className="font-medium text-success-text">
              {rupiah(row.dp_amount)}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-border pt-2.5">
            <dt className="font-medium text-text-primary">
              Bayar di tempat
            </dt>
            <dd className="text-lg font-bold text-primary">
              {rupiah(sisa)}
            </dd>
          </div>
        </dl>

        {row.catatan && (
          <p className="mt-4 rounded-lg bg-background p-3 text-sm text-text-secondary">
            Catatan: {row.catatan}
          </p>
        )}
      </div>

      <section className="mt-6 rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold text-text-primary">Langkah selanjutnya</h2>
        <ol className="mt-3 space-y-2.5 text-sm text-text-secondary">
          {[
            "Simpan nomor booking di screenshot ponsel Anda.",
            "Koordinator menghubungi Anda lewat WhatsApp untuk konfirmasi.",
            "Datang sesuai jadwal, cek barang, bayar sisa secara tunai.",
            "Status barang saat ini: " +
              LABEL_STATUS_ITEM[row.item_status as ItemStatus] +
              ". Barang tidak akan hilang dari katalog.",
          ].map((t, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {i + 1}
              </span>
              {t}
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Link
          href="/katalog"
          className="inline-flex h-11 min-h-11 flex-1 items-center justify-center rounded-lg bg-primary font-medium text-white hover:bg-primary-light"
        >
          Cari barang lain
        </Link>
        <Link
          href="/daftar/status"
          className="inline-flex h-11 min-h-11 flex-1 items-center justify-center rounded-lg border border-border bg-card font-medium text-text-primary"
        >
          Lihat status request
        </Link>
      </div>
    </div>
  );
}