import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  KOORDINATOR_COOKIE,
  isValidKey,
  keyConfigured,
} from "@/lib/auth";
import {
  getBookings,
  getRequests,
  getSettlements,
  getStats,
  rupiah,
} from "@/lib/queries";
import {
  LABEL_STATUS_BOOKING,
  LABEL_STATUS_ITEM,
  LABEL_STATUS_REQUEST,
  type BookingStatus,
  type RequestStatus,
} from "@/lib/types";

import { KoordinatorLogin } from "./koordinator-login";

export const metadata: Metadata = {
  title: "Dashboard Koordinator",
  description: "Operasional lapangan: request penjemputan dan booking.",
};

export const dynamic = "force-dynamic";

const TONE_REQ: Record<RequestStatus, "warning" | "accent" | "success" | "error"> = {
  pending: "warning",
  scheduled: "accent",
  picked_up: "accent",
  completed: "success",
  cancelled: "error",
};

const TONE_BOOK: Record<BookingStatus, "warning" | "success" | "error" | "accent"> = {
  pending: "warning",
  confirmed: "accent",
  completed: "success",
  cancelled: "error",
  no_show: "error",
};

const SLOT: Record<string, string> = {
  pagi: "Pagi 09.00-12.00",
  siang: "Siang 13.00-17.00",
};

const TONE_SETTLEMENT = {
  paid: "success",
  pending: "warning",
  cancelled: "error",
} as const;

const LABEL_SETTLEMENT = {
  paid: "Dibayar",
  pending: "Menunggu",
  cancelled: "Dibatalkan",
} as const;

export default async function KoordinatorPage() {
  const jar = await cookies();
  const authed = isValidKey(jar.get(KOORDINATOR_COOKIE)?.value);

  if (!authed) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Area internal
        </p>
        <h1 className="mt-2 text-2xl font-bold text-text-primary md:text-3xl">
          Dashboard Koordinator
        </h1>
        <p className="mt-2 max-w-lg text-sm text-text-secondary">
          Halaman ini memuat data operasional internal. Masukkan kunci
          koordinator untuk melanjutkan.
        </p>
        <KoordinatorLogin
          pesan={
            keyConfigured()
              ? undefined
              : "Server belum mengatur KOSKEMBALI_COORDINATOR_KEY."
          }
        />
        <p className="mt-6 text-xs text-text-secondary">
          <Link href="/" className="underline">
            Kembali ke beranda
          </Link>
        </p>
      </div>
    );
  }

  const stats = getStats();
  const requests = getRequests();
  const bookings = getBookings();
  const settlements = getSettlements();

  const aktif = requests.filter((r) =>
    ["pending", "scheduled", "picked_up"].includes(r.status),
  );
  const perluBayar = bookings.filter((b) => b.status === "confirmed");
  const belumLunas = settlements.filter((s) => s.status === "pending");
  const totalBelumLunas = belumLunas.reduce((a, s) => a + s.net_payout, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
            Dashboard Koordinator
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Operasional lapangan. Semua angka dari basis data.
          </p>
        </div>
        <Link
          href="/daftar"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-white"
        >
          Request Baru
        </Link>
      </div>

      {/* Statistik */}
      <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-card p-4"
          >
            <p className="text-xs text-text-secondary">{s.label}</p>
            <p className="mt-1 text-lg font-bold text-primary md:text-xl">
              {s.nilai}
            </p>
            <p className="mt-0.5 text-[11px] text-text-secondary">
              {s.keterangan}
            </p>
          </div>
        ))}
      </section>

      <div className="mt-4 rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm">
        <p className="font-medium text-text-primary">
          Unit economics saat ini: laba kotor Rp55.000 per pickup
        </p>
        <p className="mt-1 text-text-secondary">
          Fee 8 persen dari nilai barang, dikurangi biaya operasional Rp25.000
          per pickup. Jika biaya naik di atas Rp30.000 per pickup, profitabilitas
          perlu ditinjau ulang.
        </p>
      </div>

      {/* Request aktif */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-text-primary">
          Request Perlu Ditangani ({aktif.length})
        </h2>
        {aktif.length === 0 ? (
          <div className="mt-3 rounded-xl border border-border bg-card p-8 text-center text-sm text-text-secondary">
            Tidak ada request aktif.
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {aktif.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-border bg-card p-4 md:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-text-primary">
                      {r.kode} - {r.seller_nama}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {r.campus_nama} - {r.total_estimasi} barang
                    </p>
                  </div>
                  <Badge tone={TONE_REQ[r.status]}>
                    {LABEL_STATUS_REQUEST[r.status]}
                  </Badge>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-lg bg-background px-3 py-1.5 text-xs text-text-secondary">
                    {r.tgl_jemput}
                  </span>
                  <span className="rounded-lg bg-background px-3 py-1.5 text-xs text-text-secondary">
                    {SLOT[r.slot]}
                  </span>
                  {r.koordinator_nama && (
                    <span className="rounded-lg bg-background px-3 py-1.5 text-xs text-text-secondary">
                      Koordinator: {r.koordinator_nama}
                    </span>
                  )}
                  {r.jumlah_item > 0 && (
                    <span className="rounded-lg bg-success/10 px-3 py-1.5 text-xs text-success-text">
                      {r.jumlah_item} barang tercatat
                    </span>
                  )}
                </div>

                {r.catatan && (
                  <p className="mt-3 rounded-lg bg-background p-3 text-sm text-text-secondary">
                    {r.catatan}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Booking perlu pelunasan */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-text-primary">
          Perlu Pelunasan ({perluBayar.length})
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Booking terkonfirmasi. Sisa pembayaran diterima secara tunai saat
          barang diserahkan.
        </p>
        {perluBayar.length === 0 ? (
          <div className="mt-3 rounded-xl border border-border bg-card p-8 text-center text-sm text-text-secondary">
            Tidak ada pelunasan yang menunggu.
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-background">
                <tr>
                  {[
                    "Kode",
                    "Barang",
                    "Pembeli",
                    "Jadwal",
                    "Sisa Bayar",
                    "Status Barang",
                  ].map((h) => (
                    <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold text-text-secondary">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {perluBayar.map((b) => (
                  <tr key={b.kode} className="border-b border-border last:border-0">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-text-primary">
                      {b.kode}
                    </td>
                    <td className="px-4 py-3 text-text-primary">{b.item_nama}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-text-secondary">
                      {b.buyer_nama}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-text-secondary">
                      {b.tgl_pickup} ({b.slot})
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-bold text-primary">
                      {rupiah(b.item_harga - b.dp_amount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge tone="accent">
                        {LABEL_STATUS_ITEM[b.item_status]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Riwayat booking */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-text-primary">
          Riwayat Booking
        </h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-background">
              <tr>
                {["Kode", "Barang", "Pembeli", "DP", "Status"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold text-text-secondary">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.kode} className="border-b border-border last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-text-primary">
                    {b.kode}
                  </td>
                  <td className="px-4 py-3 text-text-primary">{b.item_nama}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-text-secondary">
                    {b.buyer_nama}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-success-text">
                    {rupiah(b.dp_amount)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge tone={TONE_BOOK[b.status]}>
                      {LABEL_STATUS_BOOKING[b.status]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Settlement seller */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-text-primary">
          Settlement Seller ({settlements.length})
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Total yang masih harus dibayarkan ke seller:{" "}
          <span className="font-semibold text-text-primary">
            {rupiah(totalBelumLunas)}
          </span>
        </p>
        <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-background">
              <tr>
                {[
                  "Request",
                  "Seller",
                  "Nilai Barang",
                  "Fee 8%",
                  "Dibayar ke Seller",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap px-4 py-3 font-semibold text-text-secondary"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {settlements.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-text-primary">
                    {s.pickup_kode}
                  </td>
                  <td className="px-4 py-3 text-text-primary">{s.seller_nama}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-text-secondary">
                    {rupiah(s.gross_amount)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-text-secondary">
                    {rupiah(s.fee_amount)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-primary">
                    {rupiah(s.net_payout)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge tone={TONE_SETTLEMENT[s.status]}>
                      {LABEL_SETTLEMENT[s.status]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-center text-xs text-text-secondary">
        Halaman ini untuk penggunaan internal tim lapangan.
      </p>
    </div>
  );
}