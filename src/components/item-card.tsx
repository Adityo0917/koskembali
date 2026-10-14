interface ItemCardProps {
  item: {
    id: number;
    nama: string;
    harga: number;
    kondisi: string;
    kategori: string;
    status: string;
    campus_nama: string;
    jumlah_foto: number;
    foto_utama: string | null;
  };
  labels: {
    kondisi: string;
    kategori: string;
    status: string;
  };
  warnKondisi: string;
  href: string;
  formatRupiah: (n: number) => string;
}

export function ItemCard({
  item,
  labels,
  warnKondisi,
  href,
  formatRupiah,
}: ItemCardProps) {
  const tersedia = item.status === "listed";
  const foto = item.foto_utama;

  return (
    <a
      href={href}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary/5">
        {foto ? (
          // next/image butuh optimizer; file statis mockup dilayani langsung.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={foto}
            alt={`${item.nama} - foto dokumentasi barang`}
            width={800}
            height={600}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-secondary/25">
            <svg
              className="h-12 w-12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M6.75 21h10.5a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0017.25 4.5H6.75a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 006.75 21z"
              />
            </svg>
          </div>
        )}
        {item.jumlah_foto > 0 && (
          <span className="absolute bottom-2 right-2 rounded-md bg-secondary/80 px-2 py-0.5 text-xs font-medium text-white">
            {item.jumlah_foto} foto
          </span>
        )}
        {!tersedia && (
          <span className="absolute inset-x-0 top-0 bg-secondary/90 py-1 text-center text-xs font-semibold text-white">
            {labels.status}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-text-primary">
            {item.nama}
          </h3>
          <span
            className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${warnKondisi}`}
          >
            {labels.kondisi}
          </span>
        </div>

        <p className="text-xs text-text-secondary">
          {labels.kategori} - {item.campus_nama}
        </p>

        <p className="mt-auto text-lg font-bold text-primary">
          {formatRupiah(item.harga)}
        </p>
      </div>
    </a>
  );
}