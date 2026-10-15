"use client";

import Link from "next/link";
import { useState, useRef } from "react";

const KATEGORI_OPTIONS = [
  { value: "kamar", label: "Kamar Kos (Kasur, Lemari, dll)" },
  { value: "belajar", label: "Belajar (Meja, Kursi, Rak Buku)" },
  { value: "elektronik", label: "Elektronik (Kipas, Lampu, Setrika)" },
  { value: "dapur", label: "Dapur (Kulkas mini, Panci, Kompor)" },
  { value: "perabot", label: "Perabot & Perlengkapan Rumah" },
  { value: "lainnya", label: "Lainnya" },
];

const KONDISI_OPTIONS = [
  { value: "seperti_baru", label: "Seperti Baru (90-99%)" },
  { value: "baik", label: "Baik (75-89%) - Berfungsi normal" },
  { value: "layak", label: "Layak Pakai (60-74%) - Ada bekas pakai wajar" },
  { value: "baru", label: "Baru (Belum pernah dipakai)" },
];

export function JualForm() {
  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [harga, setHarga] = useState("");
  const [kategori, setKategori] = useState("kamar");
  const [kondisi, setKondisi] = useState("baik");
  const [kampus, setKampus] = useState("Universitas Indonesia");
  const [kontakWa, setKontakWa] = useState("");
  const [lynkUrl, setLynkUrl] = useState("");

  // Foto state
  const [fotoPreviews, setFotoPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status submission
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState<{
    id: string;
    nama: string;
    deskripsi: string;
    harga: number;
    foto?: string;
    kategori: string;
    kondisi: string;
    lynkUrl: string;
  } | null>(null);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setFotoPreviews((prev) => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeFoto = (indexToRemove: number) => {
    setFotoPreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleHargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setHarga(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validasi
    if (nama.trim().length < 3) {
      setError("Nama barang wajib diisi minimal 3 karakter.");
      return;
    }
    if (deskripsi.trim().length < 5) {
      setError("Deskripsi barang wajib diisi minimal 5 karakter agar pembeli memahami kondisi barang.");
      return;
    }
    const hargaNum = parseInt(harga, 10);
    if (isNaN(hargaNum) || hargaNum <= 0) {
      setError("Harga barang harus berupa angka lebih dari Rp 0.");
      return;
    }

    setLoading(true);

    try {
      // Simpan data barang
      const newItem = {
        id: `custom-${Date.now()}`,
        nama: nama.trim(),
        deskripsi: deskripsi.trim(),
        harga: hargaNum,
        foto: fotoPreviews[0] || undefined,
        kategori,
        kondisi,
        lynkUrl:
          lynkUrl.trim() ||
          `https://lynk.id/koskembali/${nama.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        kampus,
        kontakWa: kontakWa.trim(),
        createdAt: new Date().toISOString(),
      };

      // Simpan di local storage untuk riwayat barang yang diupload pengguna
      if (typeof window !== "undefined") {
        const existing = JSON.parse(
          localStorage.getItem("koskembali_user_items") || "[]"
        );
        localStorage.setItem(
          "koskembali_user_items",
          JSON.stringify([newItem, ...existing])
        );
      }

      setSuccessData(newItem);
    } catch {
      setError("Gagal menyimpan data barang. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNama("");
    setDeskripsi("");
    setHarga("");
    setFotoPreviews([]);
    setKontakWa("");
    setLynkUrl("");
    setSuccessData(null);
    setError("");
  };

  if (successData) {
    return (
      <div className="rounded-2xl border border-success/30 bg-card p-6 md:p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-solid text-white shadow-md">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-text-primary">
            Barang Berhasil Didaftarkan!
          </h2>
          <p className="mt-2 text-text-secondary max-w-md">
            Barang bekas Anda sudah tercatat dan siap dipromosikan ke calon pembeli.
          </p>
        </div>

        {/* Ringkasan Barang Card */}
        <div className="mt-6 rounded-xl border border-border bg-background p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Ringkasan Data Barang
          </h3>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row">
            {/* Foto preview */}
            <div className="h-40 w-full sm:w-48 shrink-0 overflow-hidden rounded-lg border border-border bg-card">
              {successData.foto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={successData.foto}
                  alt={successData.nama}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-text-secondary/50">
                  <svg
                    className="h-10 w-10"
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
                  <span className="mt-1 text-xs">Tanpa Foto</span>
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col justify-between">
              <div>
                <h4 className="text-lg font-bold text-text-primary">
                  {successData.nama}
                </h4>
                <p className="mt-1 text-2xl font-black text-primary">
                  {formatRupiah(successData.harga)}
                </p>
                <p className="mt-2 text-sm text-text-secondary line-clamp-3">
                  {successData.deskripsi}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-md bg-secondary/10 px-2.5 py-1 text-text-secondary font-medium">
                  Kategori: {successData.kategori}
                </span>
                <span className="rounded-md bg-primary/10 px-2.5 py-1 text-primary font-medium">
                  Kondisi: {successData.kondisi}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <p className="text-xs text-text-secondary">
              Link Lynk.id Produk:
            </p>
            <p className="mt-1 font-mono text-sm text-primary font-semibold break-all">
              {successData.lynkUrl}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/katalog"
            className="flex-1 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-light"
          >
            Lihat Katalog Barang
          </Link>
          <button
            type="button"
            onClick={resetForm}
            className="flex-1 inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-5 text-sm font-semibold text-text-primary transition-colors hover:bg-border/50"
          >
            Jual Barang Lainnya
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error-text flex items-center gap-2">
          <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      {/* Bagian 1: Nama & Harga */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="nama" className="block text-sm font-semibold text-text-primary">
            Nama Barang <span className="text-error">*</span>
          </label>
          <input
            id="nama"
            type="text"
            required
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Contoh: Kasur Busa Single Inoac 90x200 cm"
            className="mt-1.5 h-11 w-full rounded-lg border border-border bg-card px-4 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="harga" className="block text-sm font-semibold text-text-primary">
            Harga Barang (Rp) <span className="text-error">*</span>
          </label>
          <div className="relative mt-1.5">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm font-semibold text-text-secondary">
              Rp
            </span>
            <input
              id="harga"
              type="text"
              required
              value={harga ? parseInt(harga, 10).toLocaleString("id-ID") : ""}
              onChange={handleHargaChange}
              placeholder="150.000"
              className="h-11 w-full rounded-lg border border-border bg-card pl-11 pr-4 text-sm font-semibold text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none"
            />
          </div>
          {harga && (
            <p className="mt-1 text-xs text-primary font-medium">
              = {formatRupiah(parseInt(harga, 10) || 0)}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="kategori" className="block text-sm font-semibold text-text-primary">
            Kategori Barang
          </label>
          <select
            id="kategori"
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className="mt-1.5 h-11 w-full rounded-lg border border-border bg-card px-3 text-sm text-text-primary focus:border-primary focus:outline-none"
          >
            {KATEGORI_OPTIONS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bagian 2: Deskripsi */}
      <div>
        <label htmlFor="deskripsi" className="block text-sm font-semibold text-text-primary">
          Deskripsi & Keterangan Barang <span className="text-error">*</span>
        </label>
        <textarea
          id="deskripsi"
          required
          rows={4}
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          placeholder="Jelaskan kondisi barang, kelengkapan, lama pemakaian, minus jika ada, serta alasan dijual..."
          className="mt-1.5 w-full rounded-lg border border-border bg-card p-3 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none"
        />
        <p className="mt-1 text-xs text-text-secondary">
          Deskripsi yang jelas dan jujur akan membuat barang lebih cepat laku.
        </p>
      </div>

      {/* Bagian 3: Foto Barang */}
      <div>
        <label className="block text-sm font-semibold text-text-primary">
          Foto Barang
        </label>
        <p className="text-xs text-text-secondary">
          Upload foto barang tampak depan, sudut lain, atau detail kondisi.
        </p>

        <div className="mt-2.5">
          <input
            type="file"
            accept="image/*"
            multiple
            ref={fileInputRef}
            onChange={handleFotoChange}
            className="hidden"
            id="foto-upload"
          />

          {fotoPreviews.length === 0 ? (
            <label
              htmlFor="foto-upload"
              className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card p-6 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
            >
              <svg
                className="h-10 w-10 text-text-secondary"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                />
              </svg>
              <span className="mt-2 text-sm font-semibold text-primary">
                Pilih Foto Barang
              </span>
              <span className="mt-1 text-xs text-text-secondary">
                Klik untuk memilih file gambar (PNG, JPG, JPEG)
              </span>
            </label>
          ) : (
            <div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {fotoPreviews.map((src, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-card"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Foto ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFoto(idx)}
                      className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-error text-white opacity-90 shadow hover:opacity-100"
                      title="Hapus foto"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        Foto Utama
                      </span>
                    )}
                  </div>
                ))}

                <label
                  htmlFor="foto-upload"
                  className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span className="mt-1 text-xs font-medium text-text-primary">
                    Tambah Foto
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bagian 4: Kondisi, Kampus & Lynk.id */}
      <div className="grid gap-5 md:grid-cols-3">
        <div>
          <label htmlFor="kondisi" className="block text-sm font-semibold text-text-primary">
            Kondisi Fisik
          </label>
          <select
            id="kondisi"
            value={kondisi}
            onChange={(e) => setKondisi(e.target.value)}
            className="mt-1.5 h-11 w-full rounded-lg border border-border bg-card px-3 text-sm text-text-primary focus:border-primary focus:outline-none"
          >
            {KONDISI_OPTIONS.map((kd) => (
              <option key={kd.value} value={kd.value}>
                {kd.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="kampus" className="block text-sm font-semibold text-text-primary">
            Lokasi Kampus
          </label>
          <select
            id="kampus"
            value={kampus}
            onChange={(e) => setKampus(e.target.value)}
            className="mt-1.5 h-11 w-full rounded-lg border border-border bg-card px-3 text-sm text-text-primary focus:border-primary focus:outline-none"
          >
            <option value="Universitas Indonesia">Universitas Indonesia (Depok)</option>
            <option value="Institut Teknologi Bandung">Institut Teknologi Bandung</option>
            <option value="Universitas Gadjah Mada">Universitas Gadjah Mada</option>
            <option value="Institut Teknologi Sepuluh Nopember">ITS Surabaya</option>
            <option value="Universitas Tarumanagara">Universitas Tarumanagara</option>
            <option value="Universitas Padjadjaran">Universitas Padjadjaran</option>
          </select>
        </div>

        <div>
          <label htmlFor="kontakWa" className="block text-sm font-semibold text-text-primary">
            No. WhatsApp Penjual
          </label>
          <input
            id="kontakWa"
            type="tel"
            value={kontakWa}
            onChange={(e) => setKontakWa(e.target.value)}
            placeholder="08xxxxxxxxxx"
            className="mt-1.5 h-11 w-full rounded-lg border border-border bg-card px-3 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Bagian 5: Lynk.id URL */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <label htmlFor="lynkUrl" className="block text-sm font-semibold text-primary">
          Link Pembelian / Lynk.id (Opsional)
        </label>
        <p className="text-xs text-text-secondary mt-0.5">
          Tautan ke halaman produk lynk.id Anda. Jika dikosongkan, sistem akan otomatis membuat placeholder lynk.id.
        </p>
        <input
          id="lynkUrl"
          type="url"
          value={lynkUrl}
          onChange={(e) => setLynkUrl(e.target.value)}
          placeholder="https://lynk.id/toko-anda/nama-barang"
          className="mt-2 h-11 w-full rounded-lg border border-border bg-card px-4 font-mono text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none"
        />
      </div>

      {/* Tombol Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary px-6 text-base font-semibold text-white transition-colors hover:bg-primary-light disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : "Publikasikan Barang"}
        </button>
        <p className="mt-2 text-center text-xs text-text-secondary">
          Data nama, deskripsi, foto, dan harga barang akan disimpan untuk katalog.
        </p>
      </div>
    </form>
  );
}
