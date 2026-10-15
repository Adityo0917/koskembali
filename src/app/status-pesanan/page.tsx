import type { Metadata } from "next";
import Link from "next/link";
import { getBookings } from "@/lib/queries";
import { StatusPesananClient } from "./status-pesanan-client";

export const metadata: Metadata = {
  title: "Cek Status Pesanan | KosKembali",
  description:
    "Pantau status pesanan barang kos Anda, konfirmasi booking, jadwal penjemputan, dan rincian pembayaran.",
};

export const dynamic = "force-dynamic";

export default function StatusPesananPage() {
  const bookings = getBookings();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <span>Tracking Pesanan</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-text-primary md:text-3xl">
          Status Pesanan Anda
        </h1>
        <p className="mt-2 text-sm text-text-secondary md:text-base">
          Cek progres pemesanan barang kos, jadwal pengambilan di titik temu kampus, dan status pembayaran DP Anda.
        </p>
      </div>

      <StatusPesananClient initialBookings={bookings} />

      <div className="mt-10 rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-text-primary">
          Informasi Pengambilan Barang di Kampus
        </h2>
        <ul className="mt-3 space-y-2 text-xs text-text-secondary sm:text-sm">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              <strong>Konfirmasi WhatsApp:</strong> Koordinator kampus akan menghubungi Anda maksimal 1x24 jam sebelum jadwal penjemputan.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              <strong>Pemeriksaan Langsung:</strong> Silakan cek kondisi barang di titik temu sebelum melunasi sisa pembayaran secara tunai.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              <strong>Mencari Request Penjemputan Seller?</strong> Jika Anda adalah penjual yang mengajukan penjemputan barang,{" "}
              <Link href="/daftar/status" className="font-semibold text-primary hover:underline">
                cek status request penjemputan barang di sini
              </Link>.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
