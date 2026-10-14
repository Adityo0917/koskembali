import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { getRequests } from "@/lib/queries";
import { LABEL_STATUS_REQUEST, type RequestStatus } from "@/lib/types";

export const metadata: Metadata = {
  title: "Status Request",
  description: "Lacak perjalanan request penjemputan barang Anda.",
};

export const dynamic = "force-dynamic";

const TONE: Record<RequestStatus, "warning" | "accent" | "success" | "neutral" | "error"> = {
  pending: "warning",
  scheduled: "accent",
  picked_up: "accent",
  completed: "success",
  cancelled: "error",
};

const ALUR: RequestStatus[] = ["pending", "scheduled", "picked_up", "completed"];

const DESKRIPSI: Record<RequestStatus, string> = {
  pending: "Menunggu konfirmasi koordinator",
  scheduled: "Jadwal penjemputan sudah disepakati",
  picked_up: "Barang sudah dijemput dan sedang difoto",
  completed: "Barang sudah masuk katalog",
  cancelled: "Request dibatalkan",
};

export default function StatusPage() {
  const requests = getRequests();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
        Status Request Penjemputan
      </h1>
      <p className="mt-2 text-text-secondary">
        Daftar seluruh request penjemputan barang yang tercatat.
      </p>

      {requests.length === 0 && (
        <div className="mt-8 rounded-xl border border-border bg-card p-12 text-center">
          <p className="font-medium text-text-primary">Belum ada request</p>
          <p className="mt-1 text-sm text-text-secondary">
            Request baru akan muncul di sini setelah Anda mendaftar.
          </p>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {requests.map((r) => {
          const idx = ALUR.indexOf(r.status);
          const batal = r.status === "cancelled";

          return (
            <article
              key={r.id}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-text-primary">{r.kode}</h2>
                  <p className="text-sm text-text-secondary">
                    {r.seller_nama} - {r.campus_nama}
                  </p>
                </div>
                <Badge tone={TONE[r.status]}>
                  {LABEL_STATUS_REQUEST[r.status]}
                </Badge>
              </div>

              <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                <div className="flex justify-between sm:block">
                  <dt className="text-text-secondary">Tanggal jemput</dt>
                  <dd className="font-medium text-text-primary">
                    {r.tgl_jemput} ({r.slot})
                  </dd>
                </div>
                <div className="flex justify-between sm:block">
                  <dt className="text-text-secondary">Perkiraan barang</dt>
                  <dd className="font-medium text-text-primary">
                    {r.total_estimasi} unit
                  </dd>
                </div>
                <div className="flex justify-between sm:block">
                  <dt className="text-text-secondary">Koordinator</dt>
                  <dd className="font-medium text-text-primary">
                    {r.koordinator_nama ?? "Belum ditugaskan"}
                  </dd>
                </div>
                <div className="flex justify-between sm:block">
                  <dt className="text-text-secondary">Barang tercatat</dt>
                  <dd className="font-medium text-text-primary">
                    {r.jumlah_item} unit
                  </dd>
                </div>
              </dl>

              {!batal && (
                <ol className="mt-5 space-y-2 border-t border-border pt-4">
                  {ALUR.map((s, i) => {
                    const done = i <= idx;
                    return (
                      <li key={s} className="flex items-start gap-3 text-sm">
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                            done ? "bg-success-solid text-white" : "bg-border"
                          }`}
                        >
                          <svg
                            className="h-3 w-3"
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
                        </span>
                        <span
                          className={
                            done
                              ? "font-medium text-text-primary"
                              : "text-text-secondary"
                          }
                        >
                          {DESKRIPSI[s]}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              )}

              {r.catatan && (
                <p className="mt-4 rounded-lg bg-background p-3 text-sm text-text-secondary">
                  Catatan: {r.catatan}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}