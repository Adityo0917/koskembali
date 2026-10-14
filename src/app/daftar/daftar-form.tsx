"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Campus } from "@/lib/types";

const FAKULTAS = [
  "Teknik",
  "Ilmu Hukum",
  "Informatika",
  "Ekonomi",
  "Sastra",
  "Psikologi",
  "Farmasi",
  "Pendidikan",
  "Ilmu Sosial",
  "Lainnya",
];

interface Props {
  campus: Campus[];
}

export function DaftarForm({ campus }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [nama, setNama] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [campusId, setCampusId] = useState("");
  const [fakultas, setFakultas] = useState("");
  const [cohort, setCohort] = useState("");
  const [rekening, setRekening] = useState("");
  const [tgl, setTgl] = useState("");
  const [slot, setSlot] = useState<"pagi" | "siang">("pagi");
  const [total, setTotal] = useState("3");
  const [catatan, setCatatan] = useState("");

  const field =
    "h-11 w-full rounded-lg border border-border bg-card px-3 text-sm text-text-primary";

  const validateStep1 = () => {
    if (nama.trim().length < 3) return "Nama minimal 3 karakter.";
    if (!/^08\d{8,11}$/.test(whatsapp.replace(/\s/g, "")))
      return "Nomor WhatsApp harus diawali 08 dan 10-13 digit.";
    if (!campusId) return "Pilih kampus Anda.";
    if (!fakultas) return "Pilih fakultas.";
    return "";
  };

  const next = () => {
    const e = validateStep1();
    setError(e);
    if (!e) setStep(2);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!tgl) return setError("Pilih tanggal penjemputan.");

    setLoading(true);
    try {
      const res = await fetch("/api/pickup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          whatsapp,
          campusId: Number(campusId),
          fakultas,
          cohort,
          rekening,
          tglJemput: tgl,
          slot,
          catatan,
          totalEstimasi: Number(total),
        }),
      });
      const data = (await res.json()) as { kode?: string; error?: string };
      if (!res.ok || !data.kode) {
        setError(data.error ?? "Pendaftaran gagal. Coba lagi.");
        setLoading(false);
        return;
      }
      router.push(`/daftar/status?kode=${data.kode}`);
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
      setLoading(false);
    }
  };

  const campusDipilih = campus.find((c) => String(c.id) === campusId);

  return (
    <form onSubmit={submit} className="rounded-xl border border-border bg-card p-6">
      {/* Stepper */}
      <ol className="mb-6 flex items-center gap-2">
        {["Data Diri", "Jadwal Jemput"].map((label, i) => {
          const n = i + 1;
          const aktif = step === n;
          const selesai = step > n;
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  selesai
                    ? "bg-success-solid text-white"
                    : aktif
                      ? "bg-primary text-white"
                      : "bg-border text-text-secondary"
                }`}
              >
                {selesai ? (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                ) : (
                  n
                )}
              </span>
              <span
                className={`hidden text-sm font-medium sm:block ${
                  aktif ? "text-text-primary" : "text-text-secondary"
                }`}
              >
                {label}
              </span>
              {n < 2 && <span className="h-px flex-1 bg-border" />}
            </li>
          );
        })}
      </ol>

      {step === 1 ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="d-nama" className="mb-1 block text-xs font-medium text-text-secondary">
              Nama lengkap
            </label>
            <input
              id="d-nama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className={field}
              placeholder="Andi Saputra"
              required
            />
          </div>

          <div>
            <label
              htmlFor="d-wa"
              className="mb-1 block text-xs font-medium text-text-secondary"
            >
              Nomor WhatsApp
            </label>
            <input
              id="d-wa"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className={field}
              placeholder="081234567890"
              inputMode="numeric"
              required
            />
            <p className="mt-1 text-xs text-text-secondary">
              Dipakai koordinator menghubungi Anda.
            </p>
          </div>

          <div>
            <label
              htmlFor="d-kampus"
              className="mb-1 block text-xs font-medium text-text-secondary"
            >
              Kampus
            </label>
            <select
              id="d-kampus"
              value={campusId}
              onChange={(e) => setCampusId(e.target.value)}
              className={field}
              required
            >
              <option value="">Pilih kampus</option>
              {campus.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="d-fak"
              className="mb-1 block text-xs font-medium text-text-secondary"
            >
              Fakultas
            </label>
            <select
              id="d-fak"
              value={fakultas}
              onChange={(e) => setFakultas(e.target.value)}
              className={field}
              required
            >
              <option value="">Pilih fakultas</option>
              {FAKULTAS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="d-cohort"
              className="mb-1 block text-xs font-medium text-text-secondary"
            >
              Tahun angkatan (opsional)
            </label>
            <input
              id="d-cohort"
              value={cohort}
              onChange={(e) => setCohort(e.target.value)}
              className={field}
              placeholder="S1 2022/2026"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error-text">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={next}
            className="h-12 w-full rounded-lg bg-primary text-base font-semibold text-white hover:bg-primary-light"
          >
            Lanjut ke Jadwal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg bg-background p-3 text-sm">
            <p className="font-medium text-text-primary">{nama}</p>
            <p className="text-text-secondary">
              {fakultas} - {campusDipilih?.nama}
            </p>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-1 text-xs font-medium text-primary"
            >
              Ubah
            </button>
          </div>

          <div>
            <label htmlFor="d-tgl" className="mb-1 block text-xs font-medium text-text-secondary">
              Tanggal penjemputan
            </label>
            <input
              id="d-tgl"
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
                  {s === "pagi" ? "Pagi" : "Siang"}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="d-total" className="mb-1 block text-xs font-medium text-text-secondary">
              Perkiraan jumlah barang
            </label>
            <input
              id="d-total"
              type="number"
              min={1}
              max={50}
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              className={field}
              required
            />
          </div>

          <div>
            <label htmlFor="d-rek" className="mb-1 block text-xs font-medium text-text-secondary">
              Nomor rekening (untuk pembayaran)
            </label>
            <input
              id="d-rek"
              value={rekening}
              onChange={(e) => setRekening(e.target.value)}
              className={field}
              placeholder="1234567890"
            />
          </div>

          <div>
            <label htmlFor="d-cat" className="mb-1 block text-xs font-medium text-text-secondary">
              Barang apa saja yang akan dijemput (opsional)
            </label>
            <textarea
              id="d-cat"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
              placeholder="Contoh: kasur, lemari, meja belajar"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error-text">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="h-12 min-h-12 flex-1 rounded-lg border border-border bg-card font-medium text-text-primary"
            >
              Kembali
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-12 min-h-12 flex-1 rounded-lg bg-primary text-base font-semibold text-white hover:bg-primary-light disabled:opacity-50"
            >
              {loading ? "Mengirim..." : "Daftar Sekarang"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}