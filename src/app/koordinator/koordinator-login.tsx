"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function KoordinatorLogin({ pesan }: { pesan?: string }) {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [galat, setGalat] = useState<string | null>(pesan ?? null);
  const [memuat, setMemuat] = useState(false);

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    setMemuat(true);
    setGalat(null);
    const res = await fetch("/api/koordinator/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    if (res.ok) {
      router.refresh();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setGalat(data.error ?? "Gagal masuk");
    setMemuat(false);
  }

  return (
    <form onSubmit={kirim} className="mt-6 max-w-sm">
      <label className="block text-sm font-medium text-text-primary">
        Kunci koordinator
      </label>
      <input
        type="password"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        autoComplete="current-password"
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        placeholder="Masukkan kunci akses"
      />
      {galat && <p className="mt-2 text-sm text-error-text">{galat}</p>}
      <button
        type="submit"
        disabled={memuat}
        className="mt-4 h-11 w-full rounded-lg bg-primary text-sm font-semibold text-white disabled:opacity-60"
      >
        {memuat ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}