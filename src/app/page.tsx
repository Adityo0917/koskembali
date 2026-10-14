import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { getStats } from "@/lib/queries";

const langkah = [
  {
    n: 1,
    judul: "Daftar, tanpa foto",
    teks:
      "Cukup isi nama dan WhatsApp. Tidak perlu akun email, tidak perlu foto barang.",
  },
  {
    n: 2,
    judul: "Pilih jadwal jemput",
    teks:
      "Tentukan tanggal dan waktu. Koordinator kamihubungi untuk konfirmasi.",
  },
  {
    n: 3,
    judul: "Tim fotogra/barang",
    teks:
      "Koordinator datang, memfoto, dan menetapkan harga. Anda tidak melakukan apa pun.",
  },
  {
    n: 4,
    judul: "Barang tayang",
    teks:
      "Barang masuk katalog dengan harga pasti. Bukan perlu tawar-menawar.",
  },
  {
    n: 5,
    judul: "Uang masuk",
    teks:
      "Uang ditransfer ke rekening Anda maksimal 1x24 jam setelah barang terjual.",
  },
];

const masalah = [
  {
    judul: "Nggak sempat foto",
    teks:
      "Seller paling sibuk justru paling perlu bantuan. Foto dan deskripsi kami tangani.",
  },
  {
    judul: "Takut ditipu COD",
    teks:
      "Pembayaran tunai di titik pengambilan, setelah barang Anda cek langsung.",
  },
  {
    judul: "Harga nggak jelas",
    teks:
      "Harga ditetapkan tim berdasarkan kondisi barang. Tidak ada tawar-menawar yang membuat hasil tidak pasti.",
  },
  {
    judul: "Nggak ada yang beli",
    teks:
      "Barang disimpan di katalog 60 hari, bukan langsung hilang seperti grup chat.",
  },
];

export default function HomePage() {
  const stats = getStats();

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="py-10 md:py-16">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <Badge tone="accent">Managed Consignment</Badge>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-text-primary md:text-5xl">
              Barang kosmu,{" "}
              <span className="text-primary">kami yang jemput</span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-text-secondary md:text-lg">
              Tidak perlu foto, tidak perlu negosiasi, tidak perlu ribet.
              Daftar dalam 2 menit, tim kami ambil barangnya, kamu tinggal terima
              uang.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/daftar"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-base font-semibold text-white transition-colors hover:bg-primary-light"
              >
                Jual Barang Sekarang
              </Link>
              <Link
                href="/katalog"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-primary bg-card px-6 text-base font-medium text-primary transition-colors hover:bg-primary/5"
              >
                Lihat Katalog
              </Link>
            </div>

            <p className="mt-4 text-sm text-text-secondary">
              Fee 8 persen dari harga jual. Pembayaran tunai di titik ambil.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-text-secondary">
              Angka dari operasi berjalan
            </h2>
            <dl className="mt-4 grid grid-cols-2 gap-4">
              {stats.slice(0, 4).map((s) => (
                <div key={s.label}>
                  <dt className="text-xs text-text-secondary">{s.label}</dt>
                  <dd className="mt-0.5 text-xl font-bold text-primary">
                    {s.nilai}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-text-secondary">
              Semua angka diambil langsung dari basis data, bukan estimasi.
            </p>
          </div>
        </div>
      </section>

      {/* Masalah seller */}
      <section className="border-t border-border py-10 md:py-14">
        <h2 className="text-2xl font-bold text-text-primary md:text-3xl">
          Masalah yang sering|BELajar
        </h2>
        <p className="mt-2 max-w-2xl text-text-secondary">
          Empat keluhan yang paling sering kami dengar dari mahasiswa yang
          pernah mencoba jual sendiri.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {masalah.map((m) => (
            <div
              key={m.judul}
              className="rounded-xl border border-border bg-card p-5"
            >
              <h3 className="font-semibold text-text-primary">{m.judul}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                {m.teks}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Alur */}
      <section className="border-t border-border py-10 md:py-14">
        <h2 className="text-2xl font-bold text-text-primary md:text-3xl">
          Alurnya, lima langkah
        </h2>
        <p className="mt-2 max-w-2xl text-text-secondary">
          Total waktu aktif Anda tidak lebih dari 5 menit. Sisanya dikerjakan
          tim kami.
        </p>

        <ol className="mt-8 space-y-4">
          {langkah.map((l) => (
            <li key={l.n} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-white">
                {l.n}
              </span>
              <div>
                <h3 className="font-semibold text-text-primary">{l.judul}</h3>
                <p className="mt-0.5 text-sm leading-relaxed text-text-secondary">
                  {l.teks}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Untuk buyer */}
      <section className="border-t border-border py-10 md:py-14">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <Badge tone="success">Untuk Pembeli</Badge>
            <h2 className="mt-3 text-2xl font-bold text-text-primary md:text-3xl">
              Barang yang sudah dicek fisik, bukan foto asal upload
            </h2>
            <p className="mt-3 leading-relaxed text-text-secondary">
              Setiap barang di katalog sudah difoto oleh coordinator lapangan,
              sudah dinilai kondisi, dan sudah ditetapkan harganya. Tidak ada
              fitur chat, tidak ada nego. Yang Anda lakukan hanya memesan dan
              datang mengambil.
            </p>
            <Link
              href="/katalog"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 font-semibold text-white transition-colors hover:bg-primary-light"
            >
              Telusuri Katalog
            </Link>
          </div>

          <ul className="space-y-3">
            {[
              "Kondisi barang tertulis lengkap di deskripsi, tidak ada info yang disembunyikan",
              "Harga pasti, tidak ada tawar-menawar",
              "Bayar DP Rp20.000, sisanya tunai saat ambil",
              "Barang disimpan 60 hari, tidak hilang seketika",
              "Nomor WhatsApp seller disamarkan demi privasi",
            ].map((t) => (
              <li
                key={t}
                className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
              >
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm text-text-secondary">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-10 md:py-14">
        <div className="rounded-2xl bg-primary px-6 py-10 text-center md:px-12">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Kosongkan kamar kos, hari ini juga
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white">
            Daftar tanpa biaya. Kami hubungi untuk menentukan jadwal penjemputan.
          </p>
          <Link
            href="/daftar"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-white px-8 text-base font-semibold text-primary transition-colors hover:bg-white/90"
          >
            Daftar Gratis
          </Link>
        </div>
      </section>
    </div>
  );
}