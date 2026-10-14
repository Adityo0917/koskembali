import type { Metadata } from "next";

import { getCampus } from "@/lib/queries";

import { DaftarForm } from "./daftar-form";

export const metadata: Metadata = {
  title: "Jual Barang",
  description:
    "Daftar barang kos gratis. Tim kami jemput, foto, dan tentukan harga.",
};

export const dynamic = "force-dynamic";

export default function DaftarPage() {
  const campus = getCampus();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
          Jual barang kos Anda
        </h1>
        <p className="mt-2 text-text-secondary">
          Gratis mendaftarkan. Tidak perlu foto barang, tidak perlu negosiasi.
          Fee 8 persen dibayar seller, dipotong dari hasil penjualan.
        </p>
      </div>

      <DaftarForm campus={campus} />

      <section className="mt-8 rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold text-text-primary">
          Yang perlu Anda siapkan
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-text-secondary">
          {[
            "Barang yang ingin dijemput, tidak perlu difoto",
            "Nomor WhatsApp yang aktif",
            "Nomor rekening untuk menerima pembayaran",
            "Jadwal hari Anda bisa menunggu koordinator datang",
          ].map((t) => (
            <li key={t} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {t}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}