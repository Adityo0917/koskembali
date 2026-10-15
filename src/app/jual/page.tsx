import type { Metadata } from "next";
import Link from "next/link";
import { JualForm } from "./jual-form";

export const metadata: Metadata = {
  title: "Jual Barang Bekas | KosKembali",
  description:
    "Jual barang kos bekas Anda. Input nama, deskripsi, foto, dan harga barang dengan mudah dan cepat.",
};

export default function JualPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <span>Formulir Jual Barang</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-text-primary md:text-3xl">
          Jual Barang Bekas Anda
        </h1>
        <p className="mt-2 text-sm text-text-secondary md:text-base">
          Lengkapi formulir di bawah ini dengan nama barang, deskripsi, foto, dan harga.
          Barang Anda akan siap dipromosikan dan dihubungkan ke tautan lynk.id.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
        <JualForm />
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-text-primary">
          Tips Menjual Barang Bekas Cepat Laku
        </h2>
        <ul className="mt-3 space-y-2 text-xs text-text-secondary sm:text-sm">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              <strong>Foto yang jelas:</strong> Ambil foto dari beberapa sudut dengan pencahayaan terang untuk memperlihatkan kondisi asli barang.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              <strong>Deskripsi transparan:</strong> Cantumkan ukuran, fungsi, dan minus fisik (jika ada) secara jujur agar pembeli langsung yakin.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              <strong>Harga wajar:</strong> Berikan harga kompetitif berkisar 40-70% dari harga baru agar menarik bagi sesama mahasiswa.
            </span>
          </li>
        </ul>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-text-secondary">
          Butuh tim kami untuk jemput barang dan tentukan harga otomatis?{" "}
          <Link href="/daftar" className="font-semibold text-primary hover:underline">
            Gunakan Layanan Penjemputan Barang di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
