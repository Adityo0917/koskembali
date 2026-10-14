import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { getItem, rupiah } from "@/lib/queries";
import {
  LABEL_KATEGORI,
  LABEL_KONDISI,
  LABEL_STATUS_ITEM,
  WARNA_KONDISI,
  WARNA_STATUS_ITEM,
} from "@/lib/types";

import { BookingForm } from "./booking-form";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ItemDetailPage({ params }: PageProps) {
  const { id } = await params;
  const item = getItem(Number(id));

  if (!item) notFound();

  const tersedia = item.status === "listed";
  const hemat = item.harga_baru
    ? Math.round((1 - item.harga / item.harga_baru) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:py-10">
      <nav className="mb-4 text-sm text-text-secondary">
        <Link
          href="/katalog"
          className="inline-flex min-h-11 items-center hover:text-primary"
        >
          Katalog
        </Link>
        <span className="mx-2">/</span>
        <span>{item.nama}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Galeri */}
        <div>
          <div className="aspect-[4/3] overflow-hidden rounded-xl border border-border bg-secondary/5">
            {item.foto.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.foto[0]}
                alt={`${item.nama} - foto utama dokumentasi barang`}
                width={800}
                height={600}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-secondary/25">
                <svg
                  className="h-20 w-20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M6.75 21h10.5a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0017.25 4.5H6.75a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 006.75 21z"
                  />
                </svg>
              </div>
            )}
          </div>

          {item.foto.length > 1 && (
            <div className="mt-2 grid grid-cols-4 gap-2">
              {item.foto.map((path, i) => (
                <div
                  key={path}
                  className={`aspect-square overflow-hidden rounded-lg border bg-secondary/5 ${
                    i === 0 ? "border-primary ring-1 ring-primary/40" : "border-border"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={path}
                    alt={`${item.nama} - foto ${i + 1} dari ${item.foto.length}`}
                    width={200}
                    height={200}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          <p className="mt-2 text-xs text-text-secondary">
            {item.foto.length} foto dokumentasi dari koordinator lapangan
          </p>
        </div>

        {/* Info */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{LABEL_KATEGORI[item.kategori]}</Badge>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${WARNA_KONDISI[item.kondisi]}`}
            >
              {LABEL_KONDISI[item.kondisi]}
            </span>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${WARNA_STATUS_ITEM[item.status]}`}
            >
              {LABEL_STATUS_ITEM[item.status]}
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-bold leading-snug text-text-primary">
            {item.nama}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <p className="text-3xl font-bold text-primary">
              {rupiah(item.harga)}
            </p>
            {item.harga_baru && (
              <p className="text-sm text-text-secondary line-through">
                {rupiah(item.harga_baru)}
              </p>
            )}
          </div>
          {hemat > 0 && (
            <p className="mt-1 text-sm font-medium text-success-text">
              Lebih hemat {hemat} persen dari harga baru
            </p>
          )}

          {item.deskripsi && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-text-primary">
                Deskripsi kondisi
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                {item.deskripsi}
              </p>
            </div>
          )}

          <dl className="mt-6 space-y-2.5 rounded-xl border border-border bg-card p-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-text-secondary">Lokasi pengambilan</dt>
              <dd className="text-right font-medium text-text-primary">
                {item.campus_nama}, {item.campus_kota}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-secondary">Kondisi</dt>
              <dd className="font-medium text-text-primary">
                {LABEL_KONDISI[item.kondisi]}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-secondary">Terverifikasi oleh</dt>
              <dd className="font-medium text-text-primary">
                Koordinator lapangan
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-secondary">Nomor request</dt>
              <dd className="font-medium text-text-primary">
                {item.pickup_kode}
              </dd>
            </div>
          </dl>

          <div className="mt-6">
            {tersedia ? (
              <BookingForm
                itemId={item.id}
                dpAmount={20000}
                totalDiTempat={item.total_bayar_di_tempat}
                harga={item.harga}
              />
            ) : (
              <div className="rounded-xl border border-border bg-card p-6 text-center">
                <p className="font-medium text-text-primary">
                  Barang ini sudah {LABEL_STATUS_ITEM[item.status].toLowerCase()}
                </p>
                <Link
                  href="/katalog"
                  className="mt-3 inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-medium text-white"
                >
                  Cari barang lain
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Penjelasan pembayaran */}
      <section className="mt-10 rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold text-text-primary">
          Cara kerja pembayaran
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            {
              n: 1,
              t: "Bayar DP Rp20.000",
              d: "DP mengunci barang. Barang langsung berubah status menjadi dipesan.",
            },
            {
              n: 2,
              t: "Datang sesuai jadwal",
              d: "Cek barang di lokasi. Tidak ada negosiasi harga di tempat.",
            },
            {
              n: 3,
              t: "Bayar sisa secara tunai",
              d: "Sisa dibayar di tempat setelah barang Anda periksa.",
            },
          ].map((s) => (
            <div key={s.n}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {s.n}
              </span>
              <h3 className="mt-2 text-sm font-semibold text-text-primary">
                {s.t}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                {s.d}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}