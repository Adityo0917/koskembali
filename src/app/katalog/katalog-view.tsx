"use client";

import { useState, useMemo, useEffect } from "react";
import { CONTOH_KATALOG, type KatalogItem } from "@/lib/katalog-data";

const KATEGORI_LABELS: Record<string, string> = {
  semua: "Semua Kategori",
  kamar: "Kamar Kos",
  belajar: "Belajar & Kuliah",
  elektronik: "Elektronik",
  dapur: "Dapur",
  perabot: "Perabot",
  lainnya: "Lainnya",
};

const KONDISI_LABELS: Record<string, { label: string; badge: string }> = {
  baru: { label: "Baru", badge: "bg-success/10 text-success-text border-success/30" },
  seperti_baru: { label: "Seperti Baru", badge: "bg-success/10 text-success-text border-success/30" },
  baik: { label: "Kondisi Baik", badge: "bg-warning/10 text-warning-text border-warning/30" },
  layak: { label: "Layak Pakai", badge: "bg-secondary/15 text-text-secondary border-border" },
};

const rupiah = (num: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);

function getUserItems(): KatalogItem[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("koskembali_user_items");
    if (!saved) return [];
    const items: Array<{
      id: string;
      nama: string;
      deskripsi: string;
      harga: number;
      foto?: string;
      kategori: KatalogItem["kategori"];
      kondisi: KatalogItem["kondisi"];
      lynkUrl: string;
      kampus?: string;
    }> = JSON.parse(saved);

    return items.map((u) => ({
      id: u.id,
      nama: u.nama,
      kategori: u.kategori || "lainnya",
      kondisi: u.kondisi || "baik",
      harga: u.harga,
      keterangan: u.deskripsi,
      gambar: u.foto || null,
      lynkUrl: u.lynkUrl,
      kampus: u.kampus,
      status: "tersedia",
    }));
  } catch {
    return [];
  }
}

export function KatalogView() {
  const [userItems, setUserItems] = useState<KatalogItem[]>([]);
  const [selectedKategori, setSelectedKategori] = useState("semua");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"termurah" | "termahal" | "nama">("termurah");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const loaded = getUserItems();
      if (loaded.length > 0) {
        setUserItems(loaded);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const items = useMemo(() => {
    return [...userItems, ...CONTOH_KATALOG];
  }, [userItems]);

  const filteredItems = useMemo(() => {
    let result = [...items];

    // Filter Kategori
    if (selectedKategori !== "semua") {
      result = result.filter((item) => item.kategori === selectedKategori);
    }

    // Filter Search (nama & keterangan)
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (item) =>
          item.nama.toLowerCase().includes(q) ||
          item.keterangan.toLowerCase().includes(q) ||
          (item.kampus && item.kampus.toLowerCase().includes(q))
      );
    }

    // Urutan
    result.sort((a, b) => {
      if (sortBy === "termurah") return a.harga - b.harga;
      if (sortBy === "termahal") return b.harga - a.harga;
      return a.nama.localeCompare(b.nama);
    });

    return result;
  }, [items, selectedKategori, search, sortBy]);

  const copyUrl = (id: string, url: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Banner Informasi URL Lynk.id */}
      <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            🔗
          </span>
          <div>
            <h4 className="text-sm font-semibold text-text-primary">
              Integrasi Tautan Pembelian Lynk.id
            </h4>
            <p className="text-xs text-text-secondary mt-0.5">
              Setiap barang di bawah telah diarahkan ke URL lynk.id. Anda dapat mengubah daftar URL sewaktu-waktu di file:{" "}
              <code className="rounded bg-primary/10 px-1 py-0.5 font-mono text-[11px] font-semibold text-primary">
                src/lib/katalog-data.ts
              </code>
            </p>
          </div>
        </div>
        <div className="text-xs font-semibold text-primary shrink-0">
          {items.length} Barang Terdaftar
        </div>
      </div>

      {/* Kontrol Pencarian & Filter */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-secondary">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kasur, meja, kulkas, kipas..."
            className="h-11 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none"
          />
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-text-secondary shrink-0">Urutkan:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "termurah" | "termahal" | "nama")}
            className="h-10 rounded-lg border border-border bg-card px-3 text-xs font-medium text-text-primary focus:border-primary focus:outline-none"
          >
            <option value="termurah">Harga: Termurah</option>
            <option value="termahal">Harga: Termahal</option>
            <option value="nama">Nama Barang (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Kategori Tab Filter */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(KATEGORI_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedKategori(key)}
            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
              selectedKategori === key
                ? "bg-primary text-white shadow-sm"
                : "border border-border bg-card text-text-secondary hover:bg-border/40 hover:text-text-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid Barang Bekas */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-base font-bold text-text-primary">
            Tidak Ada Barang Ditemukan
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Coba ubah kata kunci pencarian atau pilih kategori lain.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedKategori("semua");
            }}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-light"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const kondisiInfo =
              KONDISI_LABELS[item.kondisi] || KONDISI_LABELS.baik;

            return (
              <div
                key={item.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
              >
                {/* Gambar / Placeholder Gambar */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-background">
                  {item.gambar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={typeof item.gambar === "string" ? item.gambar : item.gambar.src}
                      alt={item.nama}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    /* Sesuai permintaan: Gambar dikosongi terlebih dahulu */
                    <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-text-secondary/60">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-border/60 text-text-secondary">
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M6.75 21h10.5a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0017.25 4.5H6.75a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 006.75 21z"
                          />
                        </svg>
                      </div>
                      <span className="mt-2 text-xs font-semibold text-text-secondary">
                        [Gambar Dikosongkan]
                      </span>
                      <span className="text-[10px] text-text-secondary/80">
                        Foto dapat ditambahkan nanti
                      </span>
                    </div>
                  )}

                  {/* Badge Kondisi */}
                  <div className="absolute left-3 top-3">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-sm ${kondisiInfo.badge}`}
                    >
                      {kondisiInfo.label}
                    </span>
                  </div>

                  {/* Indikator lynk.id */}
                  <div className="absolute right-3 top-3">
                    <span className="inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                      <span>lynk.id</span>
                      <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Konten Barang */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-base font-bold text-text-primary group-hover:text-primary transition-colors">
                      {item.nama}
                    </h3>
                  </div>

                  {/* Harga */}
                  <p className="mt-2 text-xl font-extrabold text-primary">
                    {rupiah(item.harga)}
                  </p>

                  {/* Keterangan */}
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-text-secondary">
                    {item.keterangan}
                  </p>

                  {/* Kampus / Kategori info */}
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[11px] text-text-secondary">
                    <span className="font-medium capitalize text-text-secondary">
                      {KATEGORI_LABELS[item.kategori] || item.kategori}
                    </span>
                    {item.kampus && (
                      <span className="truncate max-w-[140px] text-text-secondary">
                        📍 {item.kampus}
                      </span>
                    )}
                  </div>

                  {/* Informasi Link Lynk.id */}
                  <div className="mt-3 rounded-lg bg-background p-2 text-[11px] font-mono text-text-secondary">
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate text-text-secondary/80" title={item.lynkUrl}>
                        {item.lynkUrl}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => copyUrl(item.id, item.lynkUrl, e)}
                        className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-sans font-semibold text-primary hover:bg-primary/10"
                        title="Salin URL Lynk.id"
                      >
                        {copiedId === item.id ? "Tersalin!" : "Salin"}
                      </button>
                    </div>
                  </div>

                  {/* Tombol Aksi Beli / Buka Lynk.id */}
                  <div className="mt-4 pt-2">
                    <a
                      href={item.lynkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-bold text-white transition-all hover:bg-primary-light active:scale-[0.98]"
                    >
                      <span>Beli via Lynk.id</span>
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
