import { Suspense } from "react";

import { getCampus, getCatalog, type CatalogFilter } from "@/lib/queries";

import { CatalogClient } from "./catalog-client";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

function num(v: string): number | undefined {
  const n = Number(v);
  return v && !Number.isNaN(n) ? n : undefined;
}

export default async function KatalogPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const hargaIdx = first(sp.harga);
  const rentang = [
    { min: undefined, max: undefined },
    { min: undefined, max: 150000 },
    { min: 150000, max: 400000 },
    { min: 400000, max: 700000 },
    { min: 700000, max: undefined },
  ][Number(hargaIdx) || 0];

  const filter: CatalogFilter = {
    campusId: num(first(sp.kampus)),
    kategori: first(sp.kategori) || undefined,
    kondisi: first(sp.kondisi) || undefined,
    minHarga: rentang.min,
    maxHarga: rentang.max,
    q: first(sp.q) || undefined,
    sort: (first(sp.urut) as CatalogFilter["sort"]) || "termurah",
  };

  const items = getCatalog(filter);
  const campus = getCampus();

  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <CatalogClient items={items} campus={campus} total={items.length} />
    </Suspense>
  );
}

function CatalogSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="h-8 w-56 animate-pulse rounded bg-border/50" />
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-xl border border-border bg-card"
          />
        ))}
      </div>
    </div>
  );
}