import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Masuk & Daftar Akun",
  description: "Masuk ke KosKembali menggunakan Google atau email dan password.",
};

export default function LoginPage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-16 md:py-20">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Ruang untuk kembali</p>
        <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-text-primary sm:text-5xl">
          Barang berganti.<br />Cerita berlanjut.
        </h1>
        <p className="mt-5 max-w-sm leading-relaxed text-text-secondary">
          Selamat datang di KosKembali. Masuk atau buat akun untuk menjadi bagian dari sirkulasi barang kos yang lebih berarti.
        </p>
        <div className="mt-8 flex items-center gap-4 border-t border-border pt-6">
          <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary">↗</span>
          <p className="text-sm text-text-secondary">Satu akun. Lebih banyak kesempatan<br /><span className="font-semibold text-primary">untuk memberi barang rumah baru.</span></p>
        </div>
      </section>
      <LoginForm />
    </div>
  );
}
