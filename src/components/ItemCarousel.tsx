"use client";

import Link from "next/link";
import { useRef } from "react";
import type { KatalogItem } from "@/lib/katalog-data";

interface ItemCarouselProps {
  items: KatalogItem[];
}

const rupiah = (num: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);

const KONDISI_TEXT: Record<string, string> = {
  baru: "Baru",
  seperti_baru: "Seperti Baru",
  baik: "Kondisi Baik",
  layak: "Layak Pakai",
};

export function ItemCarousel({ items }: ItemCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!items || items.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const offset = direction === "left" ? -320 : 320;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <section className="py-8 md:py-12">
      <div className="flex items-end justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Katalog Terpilih</span>
          <h2 className="mt-1 text-2xl font-bold text-text-primary md:text-3xl">Barang Terbaru</h2>
        </div>
        <div className="hidden gap-2 md:flex">
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Gulir ke kiri"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-text-primary transition-colors hover:bg-border/40 focus-visible:outline-2 focus-visible:outline-primary"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Gulir ke kanan"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-text-primary transition-colors hover:bg-border/40 focus-visible:outline-2 focus-visible:outline-primary"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        tabIndex={0}
        role="region"
        aria-label="Daftar barang terbaru"
        className="mt-6 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.slice(0, 6).map((item) => {
          const imgSrc =
            typeof item.gambar === "string"
              ? item.gambar
              : item.gambar?.src || null;

          return (
            <div
              key={item.id}
              className="flex w-[80%] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md md:w-[31%]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-background">
                {imgSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imgSrc}
                    alt={item.nama}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-text-secondary/60">
                    Foto belum tersedia
                  </div>
                )}
                <span className="absolute left-2.5 top-2.5 rounded-full bg-card/90 px-2.5 py-0.5 text-[11px] font-semibold text-text-primary shadow-sm backdrop-blur-sm">
                  {KONDISI_TEXT[item.kondisi] || item.kondisi}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-1 text-sm font-bold text-text-primary">{item.nama}</h3>
                <p className="mt-1 text-base font-extrabold text-primary">{rupiah(item.harga)}</p>
                <div className="mt-auto pt-3">
                  <Link
                    href="/katalog"
                    className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                  >
                    Lihat
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
