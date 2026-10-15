"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  LABEL_STATUS_BOOKING,
  type BookingRow,
  type BookingStatus,
} from "@/lib/types";

interface Props {
  initialBookings: BookingRow[];
}

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const TONE: Record<BookingStatus, "warning" | "accent" | "success" | "neutral" | "error"> = {
  pending: "warning",
  confirmed: "accent",
  completed: "success",
  cancelled: "error",
  no_show: "neutral",
};

const STEP_LABELS = [
  "Pesanan Dibuat",
  "Dikonfirmasi Koordinator",
  "Siap Diambil di Lokasi",
  "Pesanan Selesai",
];

function getStepIndex(status: string) {
  if (status === "cancelled" || status === "no_show") return -1;
  if (status === "pending") return 0;
  if (status === "confirmed") return 2;
  if (status === "completed") return 3;
  return 1;
}

export function StatusPesananClient({ initialBookings }: Props) {
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const filteredBookings = useMemo(() => {
    let list = initialBookings;

    if (selectedFilter !== "all") {
      list = list.filter((b) => b.status === selectedFilter);
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.kode.toLowerCase().includes(q) ||
          b.item_nama.toLowerCase().includes(q) ||
          b.buyer_nama.toLowerCase().includes(q) ||
          b.campus_nama.toLowerCase().includes(q)
      );
    }

    return list;
  }, [initialBookings, selectedFilter, query]);

  return (
    <div className="space-y-6">
      {/* Search and Filter Box */}
      <div className="rounded-2xl border border-border bg-card p-4 md:p-6 shadow-sm">
        <label htmlFor="search-pesanan" className="block text-sm font-semibold text-text-primary">
          Cari Nomor Pesanan / Nama Pemesan
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-secondary">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              id="search-pesanan"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Contoh: BK-2026-0004 atau nama pembeli..."
              className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none"
            />
          </div>
          {query && (
            <button
              onClick={() => setQuery("")}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-text-secondary hover:text-text-primary"
            >
              Reset
            </button>
          )}
        </div>

        {/* Quick chip examples */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-text-secondary">
          <span>Contoh kode aktif:</span>
          {initialBookings.slice(0, 3).map((b) => (
            <button
              key={b.kode}
              type="button"
              onClick={() => setQuery(b.kode)}
              className="rounded-md border border-border bg-background px-2 py-0.5 font-mono font-medium text-primary hover:border-primary/50"
            >
              {b.kode}
            </button>
          ))}
        </div>

        {/* Filter Tab Buttons */}
        <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
          {[
            { id: "all", label: "Semua Pesanan" },
            { id: "confirmed", label: "Dikonfirmasi" },
            { id: "completed", label: "Selesai" },
            { id: "pending", label: "Menunggu" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                selectedFilter === tab.id
                  ? "bg-primary text-white"
                  : "bg-background text-text-secondary hover:bg-border/50 hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result Counter */}
      <div className="flex items-center justify-between text-sm text-text-secondary">
        <span>Menampilkan <strong>{filteredBookings.length}</strong> pesanan ditemukan</span>
        {query && <span>Filter pencarian: &ldquo;{query}&rdquo;</span>}
      </div>

      {/* Pesanan List */}
      {filteredBookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10 text-secondary">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="mt-4 text-base font-bold text-text-primary">
            Tidak Ada Pesanan yang Sesuai
          </h3>
          <p className="mt-1 text-sm text-text-secondary max-w-sm mx-auto">
            {query
              ? `Pesanan dengan kata kunci "${query}" tidak ditemukan. Pastikan nomor kode booking sudah benar.`
              : "Belum ada pesanan dengan status yang dipilih."}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            {query && (
              <button
                onClick={() => setQuery("")}
                className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-text-primary hover:bg-border/40"
              >
                Hapus Pencarian
              </button>
            )}
            <Link
              href="/katalog"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light"
            >
              Cari Barang di Katalog
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const stepIdx = getStepIndex(b.status);
            const isBatal = b.status === "cancelled" || b.status === "no_show";
            const sisaBayar = b.item_harga - (b.dp_amount || 0);

            return (
              <article
                key={b.id}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                {/* Header Card */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/50 px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-black text-primary">
                      {b.kode}
                    </span>
                    <span className="hidden text-xs text-text-secondary sm:inline">
                      Dibuat: {b.created_at.slice(0, 10)}
                    </span>
                  </div>
                  <Badge tone={TONE[b.status as BookingStatus] || "neutral"}>
                    {LABEL_STATUS_BOOKING[b.status as BookingStatus] || b.status}
                  </Badge>
                </div>

                {/* Content Details */}
                <div className="p-5 md:p-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        Barang Dipesan
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-text-primary">
                        {b.item_nama}
                      </h3>
                      <p className="mt-1 text-xl font-black text-primary">
                        {rupiah(b.item_harga)}
                      </p>
                      <p className="mt-2 text-xs text-text-secondary">
                        Lokasi Titik Temu: <strong className="text-text-primary">{b.campus_nama}</strong>
                      </p>
                    </div>

                    <div className="rounded-xl border border-border bg-background p-4 text-sm">
                      <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        Informasi Pengambilan
                      </p>
                      <dl className="mt-2.5 space-y-1.5 text-xs sm:text-sm">
                        <div className="flex justify-between">
                          <dt className="text-text-secondary">Nama Pemesan</dt>
                          <dd className="font-semibold text-text-primary">{b.buyer_nama}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-text-secondary">Jadwal Ambil</dt>
                          <dd className="font-semibold text-text-primary">
                            {b.tgl_pickup} ({b.slot === "pagi" ? "Pagi: 09.00 - 12.00" : "Siang: 13.00 - 16.00"})
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-text-secondary">Status DP (Simulasi)</dt>
                          <dd className="font-semibold text-success-text">
                            {rupiah(b.dp_amount)} ({b.dp_status === "paid" ? "Sudah Dibayar" : "Belum"})
                          </dd>
                        </div>
                        <div className="flex justify-between border-t border-border pt-1.5">
                          <dt className="font-medium text-text-primary">Sisa Bayar Tunai</dt>
                          <dd className="font-bold text-primary">{rupiah(Math.max(0, sisaBayar))}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  {/* Visual Tracker */}
                  {!isBatal && (
                    <div className="mt-6 border-t border-border pt-5">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        Tahapan Progres Pesanan
                      </p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {STEP_LABELS.map((label, idx) => {
                          const isDone = idx <= stepIdx;
                          const isCurrent = idx === stepIdx;

                          return (
                            <div
                              key={label}
                              className={`flex flex-col items-center rounded-lg p-2.5 text-center transition-all ${
                                isCurrent
                                  ? "bg-primary/10 border border-primary/30"
                                  : isDone
                                    ? "bg-success/5 border border-success/20"
                                    : "bg-background border border-border opacity-60"
                              }`}
                            >
                              <div
                                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                  isDone
                                    ? "bg-success-solid text-white"
                                    : "bg-border text-text-secondary"
                                }`}
                              >
                                {isDone ? "✓" : idx + 1}
                              </div>
                              <span
                                className={`mt-1.5 text-xs font-medium ${
                                  isDone
                                    ? "text-text-primary"
                                    : "text-text-secondary"
                                }`}
                              >
                                {label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {b.catatan && (
                    <div className="mt-4 rounded-lg bg-background p-3 text-xs text-text-secondary">
                      <strong>Catatan Tambahan:</strong> {b.catatan}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
                    <Link
                      href={`/booking/${b.kode}`}
                      className="inline-flex h-9 items-center rounded-lg border border-border bg-background px-3.5 text-xs font-semibold text-text-primary transition-colors hover:bg-border/40"
                    >
                      Buka Rincian Booking →
                    </Link>
                    <Link
                      href={`/pembayaran?booking=${encodeURIComponent(b.kode)}`}
                      className="inline-flex h-9 items-center rounded-lg bg-primary/10 px-3.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                    >
                      Simulasi Pembayaran
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
