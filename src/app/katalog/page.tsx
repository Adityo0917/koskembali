import type { Metadata } from "next";
import Link from "next/link";
import { KatalogView } from "./katalog-view";

export const metadata: Metadata = {
  title: "Katalog Barang Bekas | KosKembali",
  description:
    "Katalog pilihan barang kos bekas berkualitas. Kasur, meja, kulkas mini, dispenser, dan perabot kos siap pakai dengan tautan lynk.id.",
};

export const dynamic = "force-dynamic";

export default function KatalogPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      {/* Header Halaman */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <span>Katalog Secondhand Mahasiswa</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-text-primary md:text-3xl">
            Katalog Barang Bekas Kos
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-text-secondary md:text-base">
            Temukan barang perlengkapan kamar kos bekas berkualitas dengan harga terjangkau.
            Setiap produk langsung terhubung dengan tautan pemesanan lynk.id.
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <Link
            href="/jual"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-light"
          >
            + Jual Barang Anda
          </Link>
        </div>
      </div>

      {/* Komponen Katalog */}
      <KatalogView />
    </div>
  );
}
