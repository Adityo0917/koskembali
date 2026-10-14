"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { ItemCard } from "@/components/item-card";
import {
  LABEL_KATEGORI,
  LABEL_KONDISI,
  LABEL_STATUS_ITEM,
  WARNA_KONDISI,
  type Campus,
  type CatalogRow,
} from "@/lib/types";

interface Props {
  campus: Campus[];
  items: CatalogRow[];
  total: number;
}

const RENTANG = [
  { label: "Semua harga", min: "", max: "" },
  { label: "Di bawah Rp150.000", min: "", max: "150000" },
  { label: "Rp150.000 - Rp400.000", min: "150000", max: "400000" },
  { label: "Rp400.000 - Rp700.000", min: "400000", max: "700000" },
  { label: "Di atas Rp700.000", min: "700000", max: "" },
];

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export function CatalogClient({ campus, items, total }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [filterOpen, setFilterOpen] = useState(false);

  const campusId = params.get("kampus") ?? "";
  const kategori = params.get("kategori") ?? "";
  const kondisi = params.get("kondisi") ?? "";
  const hargaIdx = params.get("harga") ?? "";
  const sort = params.get("urut") ?? "termurah";

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/katalog?${next.toString()}`);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParam("q", q.trim());
  };

  const aktifCount =
    (campusId ? 1 : 0) +
    (kategori ? 1 : 0) +
    (kondisi ? 1 : 0) +
    (hargaIdx ? 1 : 0);

  const selectClass =
    "h-11 w-full rounded-lg border border-border bg-card px-3 text-sm text-text-primary";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
            Katalog Barang
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {total} barang tersedia. Semua sudah difoto dan dinilai oleh tim.
          </p>
        </div>

        <form onSubmit={submitSearch} className="flex w-full gap-2 md:w-auto">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari kasur, rak buku..."
            aria-label="Cari barang"
            className="h-11 min-h-11 flex-1 rounded-lg border border-border bg-card px-4 text-sm md:w-64"
          />
          <button
            type="submit"
            className="h-11 shrink-0 rounded-lg bg-primary px-5 text-sm font-medium text-white hover:bg-primary-light"
          >
            Cari
          </button>
        </form>
      </div>

      {/* Filter bar */}
      <div className="mt-6 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between p-4 md:hidden">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex h-11 items-center gap-2 text-sm font-medium text-text-primary"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
              />
            </svg>
            Filter
            {aktifCount > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-white">
                {aktifCount}
              </span>
            )}
          </button>
          <button
            onClick={() => router.push("/katalog")}
            className="inline-flex min-h-11 items-center text-sm text-text-secondary"
          >
            Reset
          </button>
        </div>

        <div
          className={`border-t border-border p-4 md:block md:border-t-0 ${filterOpen ? "block" : "hidden"}`}
        >
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
            <div>
              <label
                htmlFor="f-kampus"
                className="mb-1 block text-xs font-medium text-text-secondary"
              >
                Kampus
              </label>
              <select
                id="f-kampus"
                value={campusId}
                onChange={(e) => setParam("kampus", e.target.value)}
                className={selectClass}
              >
                <option value="">Semua kampus</option>
                {campus.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="f-kategori"
                className="mb-1 block text-xs font-medium text-text-secondary"
              >
                Kategori
              </label>
              <select
                id="f-kategori"
                value={kategori}
                onChange={(e) => setParam("kategori", e.target.value)}
                className={selectClass}
              >
                <option value="">Semua kategori</option>
                {Object.entries(LABEL_KATEGORI).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="f-kondisi"
                className="mb-1 block text-xs font-medium text-text-secondary"
              >
                Kondisi
              </label>
              <select
                id="f-kondisi"
                value={kondisi}
                onChange={(e) => setParam("kondisi", e.target.value)}
                className={selectClass}
              >
                <option value="">Semua kondisi</option>
                {Object.entries(LABEL_KONDISI).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="f-harga"
                className="mb-1 block text-xs font-medium text-text-secondary"
              >
                Rentang Harga
              </label>
              <select
                id="f-harga"
                value={hargaIdx}
                onChange={(e) => setParam("harga", e.target.value)}
                className={selectClass}
              >
                {RENTANG.map((r, i) => (
                  <option key={r.label} value={i === 0 ? "" : String(i)}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="f-urut"
                className="mb-1 block text-xs font-medium text-text-secondary"
              >
                Urutkan
              </label>
              <select
                id="f-urut"
                value={sort}
                onChange={(e) => setParam("urut", e.target.value)}
                className={selectClass}
              >
                <option value="termurah">Harga Termurah</option>
                <option value="termahal">Harga Termahal</option>
                <option value="terbaru">Terbaru</option>
              </select>
            </div>
          </div>

          <div className="mt-3 hidden justify-end md:flex">
            <button
              onClick={() => router.push("/katalog")}
              className="inline-flex min-h-11 items-center text-sm text-text-secondary hover:text-primary"
            >
              Reset semua filter
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-border bg-card p-12 text-center">
          <p className="font-medium text-text-primary">Barang tidak ditemukan</p>
          <p className="mt-1 text-sm text-text-secondary">
            Coba longgarkan filter atau kata kunci pencarian.
          </p>
          <Link
            href="/katalog"
            className="mt-4 inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-medium text-white"
          >
            Lihat semua barang
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              href={`/katalog/${item.id}`}
              formatRupiah={rupiah}
              labels={{
                kondisi: LABEL_KONDISI[item.kondisi],
                kategori: LABEL_KATEGORI[item.kategori],
                status: LABEL_STATUS_ITEM[item.status],
              }}
              warnKondisi={WARNA_KONDISI[item.kondisi]}
            />
          ))}
        </div>
      )}
    </div>
  );
}