import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-3 text-lg font-bold text-primary">KosKembali</h3>
            <p className="text-sm text-text-secondary">
              Tim kami jemput barang kos Anda, foto, dan tentukan harga. Anda
              cukup terima uang.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-text-primary">
              Navigasi
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/katalog", label: "Katalog" },
                { href: "/daftar", label: "Jual Barang" },
                { href: "/daftar/status", label: "Status Request" },
                { href: "/koordinator", label: "Dashboard Koordinator" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="inline-flex min-h-11 items-center text-sm text-text-secondary transition-colors hover:text-primary"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-text-primary">
              Kategori
            </h4>
            <ul className="space-y-2">
              {[
                { key: "perabot", label: "Perabot" },
                { key: "dapur", label: "Dapur" },
                { key: "kamar", label: "Kamar" },
                { key: "belajar", label: "Belajar" },
              ].map((c) => (
                <li key={c.key}>
                  <Link
                    href={`/katalog?kategori=${c.key}`}
                    className="inline-flex min-h-11 items-center text-sm text-text-secondary transition-colors hover:text-primary"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center">
          <p className="text-xs text-text-secondary">
            &copy; {new Date().getFullYear()} KosKembali. Demo managed
            consignment untuk submission tugas besar.
          </p>
        </div>
      </div>
    </footer>
  );
}