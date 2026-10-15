import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { getStats } from "@/lib/queries";
import { CONTOH_KATALOG } from "@/lib/katalog-data";
import { ItemCarousel } from "@/components/ItemCarousel";
import { ScrollReveal } from "@/components/ScrollReveal";

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
      "Tentukan tanggal dan waktu. Koordinator kami hubungi untuk konfirmasi.",
  },
  {
    n: 3,
    judul: "Tim foto & periksa barang",
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
    ikon: "📸",
    judul: "Nggak sempat foto",
    teks:
      "Seller paling sibuk justru paling perlu bantuan. Foto dan deskripsi kami tangani.",
  },
  {
    ikon: "🛡️",
    judul: "Takut ditipu COD",
    teks:
      "Pembayaran tunai di titik pengambilan, setelah barang Anda cek langsung.",
  },
  {
    ikon: "🏷️",
    judul: "Harga nggak jelas",
    teks:
      "Harga ditetapkan tim berdasarkan kondisi barang. Tidak ada tawar-menawar yang membuat hasil tidak pasti.",
  },
  {
    ikon: "⏳",
    judul: "Nggak ada yang beli",
    teks:
      "Barang disimpan di katalog 60 hari, bukan langsung hilang seperti grup chat.",
  },
];

export default function HomePage() {
  const stats = getStats();

  return (
    <div className="relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-x-0 top-0 -z-10 h-96 bg-gradient-to-b from-primary/10 via-primary/[0.02] to-transparent pointer-events-none" />

      <div className="mx-auto max-w-6xl px-4">
        {/* Hero */}
        <section className="py-10 md:py-16">
          <div className="grid items-center gap-10 md:grid-cols-2">
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
                  href="/jual"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-base font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-light hover:shadow-lg active:translate-y-0"
                >
                  Jual Barang Sekarang
                </Link>
                <Link
                  href="/katalog"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-primary bg-card px-6 text-base font-medium text-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/5 active:translate-y-0"
                >
                  Lihat Katalog
                </Link>
              </div>

              <p className="mt-4 text-sm text-text-secondary">
                Fee 8 persen dari harga jual. Pembayaran tunai di titik ambil.
              </p>
            </div>

            {/* Visual Kanan + Floating Stats */}
            <div className="relative pb-10 sm:pb-8">
              {/* Visual 2x2 Grid Kartu Barang */}
              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border/80 bg-card/60 p-4 shadow-sm backdrop-blur-sm sm:gap-4 sm:p-5">
                <div className="rounded-xl border border-border bg-card p-3 shadow-xs transition-transform duration-200 hover:-translate-y-0.5">
                  <div className="text-2xl">🛏️</div>
                  <p className="mt-2 text-xs font-bold text-text-primary line-clamp-1">Kasur Single Busa</p>
                  <p className="mt-0.5 text-xs font-extrabold text-primary">Rp350.000</p>
                  <span className="mt-1 inline-block rounded bg-success/15 px-1.5 py-0.5 text-[10px] font-semibold text-success-text">Terverifikasi</span>
                </div>

                <div className="rounded-xl border border-border bg-card p-3 shadow-xs transition-transform duration-200 hover:-translate-y-0.5">
                  <div className="text-2xl">🪑</div>
                  <p className="mt-2 text-xs font-bold text-text-primary line-clamp-1">Kursi Belajar Putar</p>
                  <p className="mt-0.5 text-xs font-extrabold text-primary">Rp280.000</p>
                  <span className="mt-1 inline-block rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">Siap Ambil</span>
                </div>

                <div className="rounded-xl border border-border bg-card p-3 shadow-xs transition-transform duration-200 hover:-translate-y-0.5">
                  <div className="text-2xl">❄️</div>
                  <p className="mt-2 text-xs font-bold text-text-primary line-clamp-1">Kulkas Mini 42L</p>
                  <p className="mt-0.5 text-xs font-extrabold text-primary">Rp750.000</p>
                  <span className="mt-1 inline-block rounded bg-success/15 px-1.5 py-0.5 text-[10px] font-semibold text-success-text">Terverifikasi</span>
                </div>

                <div className="rounded-xl border border-border bg-card p-3 shadow-xs transition-transform duration-200 hover:-translate-y-0.5">
                  <div className="text-2xl">💨</div>
                  <p className="mt-2 text-xs font-bold text-text-primary line-clamp-1">Kipas Angin Stand</p>
                  <p className="mt-0.5 text-xs font-extrabold text-primary">Rp140.000</p>
                  <span className="mt-1 inline-block rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">Siap Ambil</span>
                </div>
              </div>

              {/* Floating Stat Card */}
              <div className="absolute -bottom-4 left-2 right-2 rounded-xl border border-border/90 bg-card/95 p-3.5 shadow-lg backdrop-blur-md sm:left-auto sm:right-4 sm:max-w-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Statistik Operasi</span>
                  <span className="flex h-2 w-2 rounded-full bg-success" />
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-2 text-left">
                  {stats.slice(0, 2).map((s) => (
                    <div key={s.label}>
                      <dt className="text-[10px] text-text-secondary">{s.label}</dt>
                      <dd className="text-sm font-bold text-primary">{s.nilai}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </section>

        {/* Strip Kepercayaan */}
        <section className="border-y border-border bg-card/40 py-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 text-center">
            <div className="flex items-center justify-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">🔍</span>
              <div className="text-left">
                <p className="text-xs font-bold text-text-primary">Dicek Fisik</p>
                <p className="text-[11px] text-text-secondary">Kondisi dinilai langsung di lokasi</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">🏷️</span>
              <div className="text-left">
                <p className="text-xs font-bold text-text-primary">Harga Pasti</p>
                <p className="text-[11px] text-text-secondary">Tanpa drama tawar-menawar</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">⚡</span>
              <div className="text-left">
                <p className="text-xs font-bold text-text-primary">Uang Cair 1x24 Jam</p>
                <p className="text-[11px] text-text-secondary">Ditransfer begitu barang laku</p>
              </div>
            </div>
          </div>
        </section>

        {/* Carousel Barang Terbaru */}
        <ScrollReveal>
          <ItemCarousel items={CONTOH_KATALOG} />
        </ScrollReveal>

        {/* Masalah seller */}
        <ScrollReveal>
          <section className="border-t border-border py-10 md:py-14">
            <h2 className="text-2xl font-bold text-text-primary md:text-3xl">
              Masalah yang sering dialami
            </h2>
            <p className="mt-2 max-w-2xl text-text-secondary">
              Empat keluhan yang paling sering kami dengar dari mahasiswa yang
              pernah mencoba jual sendiri.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {masalah.map((m) => (
                <div
                  key={m.judul}
                  className="group rounded-xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex items-start gap-3.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xl transition-colors group-hover:bg-primary/20">
                      {m.ikon}
                    </span>
                    <div>
                      <h3 className="font-semibold text-text-primary">{m.judul}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                        {m.teks}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* Alur Timeline Vertikal */}
        <ScrollReveal>
          <section className="border-t border-border py-10 md:py-14">
            <h2 className="text-2xl font-bold text-text-primary md:text-3xl">
              Alurnya, lima langkah
            </h2>
            <p className="mt-2 max-w-2xl text-text-secondary">
              Total waktu aktif Anda tidak lebih dari 5 menit. Sisanya dikerjakan
              tim kami.
            </p>

            <div className="relative mt-8 pl-4 md:pl-6">
              <div className="space-y-6">
                {langkah.map((l, idx) => (
                  <div key={l.n} className="relative flex gap-4">
                    {/* Garis vertikal antar nomor */}
                    {idx < langkah.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="absolute left-5 top-10 -bottom-6 w-0.5 bg-border"
                      />
                    )}
                    <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-white shadow-sm ring-4 ring-card">
                      {l.n}
                    </span>
                    <div className="pt-1">
                      <h3 className="font-semibold text-text-primary">{l.judul}</h3>
                      <p className="mt-0.5 text-sm leading-relaxed text-text-secondary">
                        {l.teks}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Untuk buyer */}
        <ScrollReveal>
          <section className="border-t border-border py-10 md:py-14">
            <div className="grid gap-6 md:grid-cols-2 md:items-center">
              <div>
                <Badge tone="success">Untuk Pembeli</Badge>
                <h2 className="mt-3 text-2xl font-bold text-text-primary md:text-3xl">
                  Barang yang sudah dicek fisik, bukan foto asal upload
                </h2>
                <p className="mt-3 leading-relaxed text-text-secondary">
                  Setiap barang di katalog sudah difoto oleh koordinator lapangan,
                  sudah dinilai kondisi, dan sudah ditetapkan harganya. Tidak ada
                  fitur chat, tidak ada nego. Yang Anda lakukan hanya memesan dan
                  datang mengambil.
                </p>
                <Link
                  href="/katalog"
                  className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-light hover:shadow-lg active:translate-y-0"
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
                    className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30"
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
        </ScrollReveal>

        {/* CTA Banner Dekoratif */}
        <ScrollReveal>
          <section className="border-t border-border py-10 md:py-14">
            <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-10 text-center md:px-12 md:py-12">
              {/* Pola dekoratif ringan lingkaran */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
              />

              <div className="relative z-10">
                <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                  Dipercaya oleh ratusan mahasiswa di Jabodetabek & Bandung
                </span>
                <h2 className="mt-3 text-2xl font-bold text-white md:text-3xl">
                  Kosongkan kamar kos, hari ini juga
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-white/90">
                  Daftar tanpa biaya. Kami hubungi untuk menentukan jadwal penjemputan.
                </p>
                <Link
                  href="/jual"
                  className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-white px-8 text-base font-semibold text-primary shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/95 hover:shadow-xl active:translate-y-0"
                >
                  Jual Barang Sekarang
                </Link>
              </div>
            </div>
          </section>
        </ScrollReveal>
      </div>
    </div>
  );
}