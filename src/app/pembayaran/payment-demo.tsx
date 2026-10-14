"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const methods = [
  { id: "qris", label: "QRIS", detail: "Satu alur untuk berbagai aplikasi pembayaran", mark: "QR", instruction: "Pada pembayaran sungguhan, kode QR muncul di sini untuk dipindai. Demo ini tidak membuat kode QR yang dapat digunakan untuk membayar." },
  { id: "bank", label: "Virtual account", detail: "Bayar melalui aplikasi mobile banking", mark: "VA", instruction: "Pada pembayaran sungguhan, nomor virtual account dan bank tujuan muncul di sini. Demo ini tidak menerbitkan nomor rekening atau instruksi transfer nyata." },
  { id: "wallet", label: "Dompet digital", detail: "Lanjutkan melalui aplikasi e-wallet", mark: "EW", instruction: "Pada pembayaran sungguhan, Anda diarahkan ke aplikasi dompet digital. Demo ini tidak membuka aplikasi lain atau meminta PIN Anda." },
] as const;

type Method = typeof methods[number]["id"];
type Step = "method" | "review" | "success";

export function PaymentDemo({ initialBooking }: { initialBooking: string }) {
  const [booking, setBooking] = useState(initialBooking);
  const [method, setMethod] = useState<Method>("qris");
  const [step, setStep] = useState<Step>("method");
  const [accepted, setAccepted] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const selected = methods.find((entry) => entry.id === method)!;
  const stepNumber = step === "method" ? 1 : step === "review" ? 2 : 3;
  const amount = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(20000);

  useEffect(() => {
    if (step !== "method") heading.current?.focus();
  }, [step]);

  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStep("review");
  }

  function reset() {
    setAccepted(false);
    setStep("method");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <Link href="/katalog" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary"><span aria-hidden="true">←</span> Kembali ke katalog</Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Pembayaran KosKembali</p>
        <Badge tone="warning">Mode simulasi</Badge>
      </div>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Satu langkah lebih dekat<br className="hidden sm:block" /> ke barang pilihanmu.</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-text-secondary">Kenali alur pembayaran DP Rp20.000 sebelum mengambil barang. Coba metodenya, tanpa mengeluarkan uang.</p>

      <div className="mt-6 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm leading-relaxed text-warning-text">
        <strong>Ini bukan pembayaran sungguhan.</strong> Tidak ada uang yang ditagih atau ditransfer. Hasil simulasi tidak menjadi bukti pembayaran dan tidak mengubah status booking. Demo direset ketika halaman dimuat ulang.
      </div>

      <ol aria-label="Tahapan simulasi pembayaran" className="my-8 flex max-w-xl items-start gap-3 sm:gap-6">
        {["Pilih metode", "Konfirmasi", "Selesai"].map((label, index) => (
          <li key={label} aria-current={stepNumber === index + 1 ? "step" : undefined} className={`flex min-w-0 flex-1 items-center gap-2 text-xs font-semibold sm:text-sm ${stepNumber >= index + 1 ? "text-primary" : "text-text-secondary"}`}>
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${stepNumber >= index + 1 ? "border-primary bg-primary text-white" : "border-border bg-card"}`}>{index + 1}</span>{label}
          </li>
        ))}
      </ol>

      <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr] lg:gap-8">
        <section className="min-w-0 rounded-2xl border border-border bg-card p-5 sm:p-8" aria-label="Formulir simulasi">
          {step === "method" && (
            <form onSubmit={review}>
              <h2 className="text-xl font-bold">Pilih cara pembayaran</h2>
              <p className="mt-1 text-sm text-text-secondary">Semua metode di bawah hanya untuk demonstrasi.</p>
              <div className="mt-6">
                <label htmlFor="payment-booking" className="mb-2 block text-sm font-medium">Kode booking <span className="font-normal text-text-secondary">(opsional)</span></label>
                <input id="payment-booking" value={booking} onChange={(event) => setBooking(event.target.value.toUpperCase())} pattern="BK-[0-9]{4}-[0-9]{4,}" maxLength={30} title="Gunakan format BK-2026-0001 atau kosongkan untuk demo." placeholder="Contoh: BK-2026-0001" aria-describedby="booking-help" className="h-12 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <p id="booking-help" className="mt-2 text-xs text-text-secondary">Kosongkan untuk mencoba tanpa booking. Kode hanya menjadi referensi demo, bukan verifikasi pesanan.</p>
              </div>
              <fieldset className="mt-6 space-y-3">
                <legend className="mb-3 text-sm font-semibold">Metode pembayaran demo</legend>
                {methods.map((entry) => (
                  <label key={entry.id} className={`flex min-h-24 cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors sm:gap-4 ${method === entry.id ? "border-primary bg-primary/5" : "border-border hover:bg-background"}`}>
                    <span aria-hidden="true" className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border bg-card text-xs font-bold ${method === entry.id ? "border-primary/20 text-primary" : "border-border text-text-secondary"}`}>{entry.mark}</span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{entry.label}</span><span className="mt-1 block text-xs leading-relaxed text-text-secondary">{entry.detail}</span></span>
                    <input type="radio" name="payment-method" value={entry.id} checked={method === entry.id} onChange={() => setMethod(entry.id)} className="h-5 w-5 shrink-0 accent-primary" />
                  </label>
                ))}
              </fieldset>
              <Button type="submit" className="mt-7 w-full">Lanjutkan simulasi <span aria-hidden="true" className="ml-2">→</span></Button>
            </form>
          )}

          {step === "review" && (
            <form onSubmit={(event) => { event.preventDefault(); if (accepted) setStep("success"); }}>
              <h2 className="text-xl font-bold" tabIndex={-1} ref={heading}>Konfirmasi simulasi</h2>
              <p className="mt-2 text-sm text-text-secondary">Metode pilihan: <strong>{selected.label}</strong></p>
              <div className="my-6 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6">
                <span className="inline-flex rounded-md border border-primary/20 bg-card px-3 py-2 text-sm font-bold text-primary">{selected.mark} · DEMO</span>
                <p className="mt-4 text-sm leading-relaxed text-text-secondary">{selected.instruction}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-primary">Tidak ada instruksi pembayaran nyata</p>
              </div>
              <label className="flex min-h-12 cursor-pointer items-start gap-3 text-sm leading-relaxed"><input type="checkbox" required checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-primary" /><span>Saya memahami bahwa ini hanya simulasi dan tidak ada uang yang dibayarkan.</span></label>
              <Button type="submit" className="mt-6 w-full" disabled={!accepted}>Simulasikan pembayaran {amount}</Button>
              <Button type="button" variant="secondary" className="mt-3 w-full" onClick={() => { setAccepted(false); setStep("method"); }}>Ubah metode</Button>
            </form>
          )}

          {step === "success" && (
            <div className="py-3" role="status">
              <span aria-hidden="true" className="flex h-16 w-16 items-center justify-center rounded-full bg-success-solid text-white"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
              <Badge tone="warning" className="mt-5">Hasil demo · bukan transaksi nyata</Badge>
              <h2 className="mt-4 text-2xl font-bold" tabIndex={-1} ref={heading}>Simulasi pembayaran berhasil</h2>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">Anda telah mencoba pembayaran DP {amount} melalui {selected.label}. Tidak ada saldo yang terpotong dan status booking tidak berubah.</p>
              <p className="mt-4 rounded-lg bg-background p-4 text-sm text-text-secondary">Hasil ini hanya ditampilkan selama halaman terbuka, tidak disimpan sebagai riwayat transaksi, dan tidak dapat digunakan sebagai bukti pembayaran.</p>
              <div className="mt-6 flex flex-col gap-3">
                {booking && <Link href={`/booking/${encodeURIComponent(booking)}`} className="flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-center font-medium text-white hover:bg-primary-dark">Lihat booking</Link>}
                <Link href="/katalog" className="flex min-h-11 items-center justify-center rounded-lg border border-border px-4 text-center font-medium text-primary">Kembali ke katalog</Link>
                <Button variant="secondary" onClick={reset}>Coba metode lain</Button>
              </div>
            </div>
          )}
        </section>

        <aside className="min-w-0 overflow-hidden rounded-2xl bg-primary-dark text-white">
          <div className="p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Ringkasan demo</p>
            <h2 className="mt-4 text-xl font-bold">DP pemesanan barang</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/80">Contoh pembayaran awal. Pelunasan barang tetap mengikuti kesepakatan saat pengambilan.</p>
            <dl className="mt-7 space-y-4 text-sm">
              <div className="flex flex-wrap justify-between gap-2"><dt className="text-white/80">Referensi</dt><dd className="break-all font-medium">{booking || "Tanpa booking · demo"}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-white/80">Metode</dt><dd className="font-medium">{selected.label}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-white/80">DP contoh</dt><dd className="font-medium">{amount}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-white/80">Biaya admin demo</dt><dd className="font-medium">Rp0</dd></div>
              <div className="border-t border-white/20 pt-5"><dt className="text-white/80">Total simulasi</dt><dd className="mt-1 text-4xl font-bold tracking-tight">{amount}</dd></div>
            </dl>
          </div>
          <div className="border-t border-white/15 bg-white/5 px-6 py-5 sm:px-8"><p className="text-sm font-semibold">Uang sungguhan yang ditagih: Rp0</p><p className="mt-2 text-xs leading-relaxed text-white/80">Jangan melakukan transfer atau membagikan PIN, OTP, dan data kartu untuk demo ini.</p></div>
        </aside>
      </div>
    </div>
  );
}
