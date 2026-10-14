import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <p className="text-5xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-bold text-text-primary">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-2 text-text-secondary">
        Barang yang Anda cari mungkin sudah terjual atau tautannya salah.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Link
          href="/katalog"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 font-medium text-white"
        >
          Lihat katalog
        </Link>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-6 font-medium text-text-primary"
        >
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}