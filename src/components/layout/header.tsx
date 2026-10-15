"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/katalog", label: "Katalog" },
  { href: "/jual", label: "Jual Barang" },
  { href: "/status-pesanan", label: "Status Pesanan" },
  { href: "/pembayaran", label: "Pembayaran" },
  { href: "/koordinator", label: "Dashboard" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, ready } = useAuth();
  const aktif = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex min-h-11 items-center pr-2" aria-label="Beranda KosKembali">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-koskembali.png"
            alt="KosKembali"
            className="h-10 w-auto object-contain"
          />
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                aktif(link.href)
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:bg-border/50 hover:text-text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/login" className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm font-semibold text-primary hover:bg-primary/5">
            {!ready ? "Akun" : user ? "Akun Saya" : "Masuk"}
          </Link>
          <Link
            href="/jual"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-light"
          >
            Jual Barang
          </Link>
        </div>

        <button
          className="flex h-11 w-11 items-center justify-center rounded-lg transition-colors hover:bg-border/50 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {open ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-card lg:hidden">
          <nav aria-label="Navigasi seluler" className="flex flex-col gap-1 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  aktif(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:bg-border/50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-border" />
            <Link href="/login" onClick={() => setOpen(false)} className="rounded-lg border border-border px-4 py-3 text-center text-sm font-semibold text-primary">
              {!ready ? "Akun" : user ? "Akun Saya" : "Masuk / Daftar"}
            </Link>
            <Link
              href="/jual"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-primary px-4 py-3 text-center text-sm font-medium text-white"
            >
              Jual Barang
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
