"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  itemId: number;
  harga: number;
  dpAmount: number;
  totalDiTempat: number;
}

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export function BookingForm({
  itemId,
  harga,
  dpAmount,
  totalDiTempat,
}: Props) {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [tgl, setTgl] = useState("");
  const [slot, setSlot] = useState<"pagi" | "siang">("pagi");
  const [catatan, setCatatan] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (nama.trim().length < 3) return setError("Nama minimal 3 karakter.");
    if (!/^08\d{8,11}$/.test(whatsapp.replace(/\s/g, "")))
      return setError("Nomor WhatsApp harus diawali 08 dan 10-13 digit.");
    if (!tgl) return setError("Pilih tanggal pengambilan.");

    setLoading(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          nama,
          whatsapp,
          tgl,
          slot,
          catatan,
        }),
      });
      const data = (await res.json()) as { kode?: string; error?: string };
      if (!res.ok || !data.kode) {
        setError(data.error ?? "Pemesanan gagal. Coba lagi.");
        setLoading(false);
        return;
      }
      router.push(`/booking/${data.kode}`);
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
      setLoading(false);
    }
  };

  const field =
    "h-11 w-full rounded-lg border border-border bg-card px-3 text-sm text-text-primary";

  return (
    <form onSubmit={submit} className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-semibold text-text-primary">Pesan barang ini</h2>
      <p className="mt-1 text-xs text-text-secondary">
        Bayar DP Rp20.000 untuk mengunci barang.
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor="b-nama" className="mb-1 block text-xs font-medium text-text-secondary">
            Nama lengkap
          </label>
          <input
            id="b-nama"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className={field}
            placeholder="Rina Amelia"
            required
          />
        </div>

        <div>
          <label
            htmlFor="b-wa"
            className="mb-1 block text-xs font-medium text-text-secondary"
          >
            Nomor WhatsApp
          </label>
          <input
            id="b-wa"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className={field}
            placeholder="081234567890"
            inputMode="numeric"
            required
          />
        </div>

        <div>
          <label
            htmlFor="b-tgl"
            className="mb-1 block text-xs font-medium text-text-secondary"
          >
            Tanggal pengambilan
          </label>
          <input
            id="b-tgl"
            type="date"
            value={tgl}
            onChange={(e) => setTgl(e.target.value)}
            className={field}
            required
          />
        </div>

        <fieldset>
          <legend className="mb-1 block text-xs font-medium text-text-secondary">
            Slot waktu
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {(["pagi", "siang"] as const).map((s) => (
              <label
                key={s}
                className={`flex h-11 cursor-pointer items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                  slot === s
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-text-secondary"
                }`}
              >
                <input
                  type="radio"
                  name="slot"
                  value={s}
                  checked={slot === s}
                  onChange={() => setSlot(s)}
                  className="sr-only"
                />
                {s === "pagi" ? "Pagi (09.00-12.00)" : "Siang (13.00-17.00)"}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label
            htmlFor="b-cat"
            className="mb-1 block text-xs font-medium text-text-secondary"
          >
            Catatan (opsional)
          </label>
          <textarea
            id="b-cat"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            placeholder="Contoh: bisa ambil setelah jam 14.00"
          />
        </div>
      </div>

      <dl className="mt-5 space-y-1.5 rounded-lg bg-background p-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-text-secondary">Harga barang</dt>
          <dd className="font-medium">{rupiah(harga)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-text-secondary">DP saat pemesanan</dt>
          <dd className="font-medium text-primary">{rupiah(dpAmount)}</dd>
        </div>
        <div className="flex justify-between border-t border-border pt-1.5">
          <dt className="font-medium">Bayar di tempat</dt>
          <dd className="font-bold">{rupiah(totalDiTempat)}</dd>
        </div>
      </dl>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error-text"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary text-base font-semibold text-white transition-colors hover:bg-primary-light disabled:opacity-50"
      >
        {loading ? "Memproses..." : "Pesan dengan DP Rp20.000"}
      </button>

      <p className="mt-3 text-center text-xs text-text-secondary">
        Barang dijamin karena sudah dipesan.
      </p>
    </form>
  );
}